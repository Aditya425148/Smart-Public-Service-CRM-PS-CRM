import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface SLATimerProps {
    deadline: string;
    status: string;
    onOverdue?: () => void;
    showIcon?: boolean;
}

export const SLATimer: React.FC<SLATimerProps> = ({
    deadline,
    status,
    onOverdue,
    showIcon = true
}) => {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
        isOverdue: boolean;
    } | null>(null);

    useEffect(() => {
        if (["Resolved", "Closed"].includes(status)) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(deadline);
            const diff = target.getTime() - now.getTime();

            const isOverdue = diff <= 0;
            const absoluteDiff = Math.abs(diff);

            const hours = Math.floor(absoluteDiff / (1000 * 60 * 60));
            const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000);

            const newTimeLeft = { hours, minutes, seconds, isOverdue };

            if (isOverdue && !timeLeft?.isOverdue && onOverdue) {
                onOverdue();
            }

            setTimeLeft(newTimeLeft);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline, status]);

    if (["Resolved", "Closed"].includes(status)) {
        return (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase text-[10px]">
                {showIcon && <CheckCircle size={12} />}
                <span>COMPLETED</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    const { hours, minutes, seconds, isOverdue } = timeLeft;

    // Determine colors based on remaining time
    let textColor = "text-emerald-600";
    let bgColor = "bg-emerald-50";
    let borderColor = "border-emerald-100";

    if (isOverdue) {
        textColor = "text-red-600 animate-pulse";
        bgColor = "bg-red-50";
        borderColor = "border-red-100";
    } else if (hours < 12) {
        textColor = "text-amber-600";
        bgColor = "bg-amber-50";
        borderColor = "border-amber-100";
    }

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${bgColor} ${borderColor} ${textColor} transition-colors duration-500 cursor-help`}
            title={`Deadline: ${new Date(deadline).toLocaleString()}`}
        >
            {showIcon && (isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />)}
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none mb-0.5">
                    {isOverdue ? "OVERDUE" : "SLA DEADLINE"}
                </span>
                <span className="text-[11px] font-bold font-mono tracking-tight leading-none">
                    {isOverdue ? "-" : ""}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
            </div>
        </div>
    );
};
