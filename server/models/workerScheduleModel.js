const { pool } = require('../db/index');
const BookingModel = require('./bookingModel');

class WorkerScheduleModel {
    static async getScheduleByWorker(workerId) {
        const query = `
            SELECT *
            FROM worker_availability_schedule
            WHERE worker_id = ?
            AND is_available = TRUE
            ORDER BY day_of_week ASC, start_time ASC
        `;

        const [rows] = await pool.query(query, [workerId]);
        return rows;
    }

    static async setWeeklyAvailability(workerId, scheduleRows) {
        const deleteQuery = `DELETE FROM worker_availability_schedule WHERE worker_id = ?`;
        await pool.query(deleteQuery, [workerId]);

        const insertQuery = `
            INSERT INTO worker_availability_schedule (
                worker_id, day_of_week, start_time, end_time, break_start_time, break_end_time, is_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const promises = scheduleRows.map((row) => {
            return pool.query(insertQuery, [
                workerId,
                row.day_of_week,
                row.start_time,
                row.end_time,
                row.break_start_time || null,
                row.break_end_time || null,
                row.is_available !== false
            ]);
        });

        await Promise.all(promises);
        return true;
    }

    static async getBlockedDates(workerId) {
        const query = `
            SELECT *
            FROM worker_blocked_dates
            WHERE worker_id = ?
            ORDER BY blocked_date ASC
        `;
        const [rows] = await pool.query(query, [workerId]);
        return rows;
    }

    static async blockDate(workerId, blockedDate, reason) {
        const query = `
            INSERT INTO worker_blocked_dates (worker_id, blocked_date, reason, is_blocked, created_at)
            VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE reason = VALUES(reason), is_blocked = TRUE, updated_at = CURRENT_TIMESTAMP
        `;
        const [result] = await pool.query(query, [workerId, blockedDate, reason || 'Blocked']);
        return result;
    }

    static async isDateBlocked(workerId, blockedDate) {
        const query = `
            SELECT 1 FROM worker_blocked_dates
            WHERE worker_id = ? AND blocked_date = ? AND is_blocked = TRUE
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [workerId, blockedDate]);
        return rows.length > 0;
    }

    static async getAvailableSlots(category, date) {
        const dayOfWeek = new Date(date).getDay();

        const query = `
            SELECT wp.id AS worker_id,
                   wp.user_id AS worker_user_id,
                   wp.service_category,
                   s.start_time,
                   s.end_time,
                   s.break_start_time,
                   s.break_end_time
            FROM worker_profiles wp
            JOIN worker_availability_schedule s ON wp.id = s.worker_id
            WHERE wp.service_category = ?
              AND wp.verification_status = 'verified'
              AND wp.is_available = TRUE
              AND s.day_of_week = ?
              AND s.is_available = TRUE
              AND NOT EXISTS (
                  SELECT 1 FROM worker_blocked_dates bd
                  WHERE bd.worker_id = wp.id
                    AND bd.blocked_date = ?
                    AND bd.is_blocked = TRUE
              )
        `;

        const [rows] = await pool.query(query, [category, dayOfWeek, date]);
        const timeSlots = [];

        for (const row of rows) {
            const bookedSlots = await BookingModel.getBookedSlots(row.worker_id, date);
            let currentTime = row.start_time;
            const endTime = row.end_time;
            const breakStart = row.break_start_time;
            const breakEnd = row.break_end_time;

            while (currentTime < endTime) {
                const nextHour = new Date(`1970-01-01T${currentTime}Z`);
                nextHour.setHours(nextHour.getHours() + 1);
                const nextTime = nextHour.toISOString().substr(11, 8);

                if (nextTime > endTime) break;

                const inBreak = breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd;
                const alreadyBooked = bookedSlots.includes(currentTime);
                if (!inBreak && !alreadyBooked) {
                    timeSlots.push({
                        worker_id: row.worker_id,
                        worker_user_id: row.worker_user_id,
                        scheduled_time: currentTime,
                        available: true
                    });
                }
                currentTime = nextTime;
            }
        }

        return timeSlots;
    }
}

module.exports = WorkerScheduleModel;
