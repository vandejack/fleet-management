'use client';

import React from 'react';
import { X } from 'lucide-react';

interface FloatingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    width?: string; // e.g., '25%', '40%', '50%'
    children: React.ReactNode;
}

export default function FloatingPanel({
    isOpen,
    onClose,
    title,
    width = '30%',
    children
}: FloatingPanelProps) {
    if (!isOpen) return null;

    return (
        <div
            className={`fixed top-4 left-[280px] h-[calc(100vh-32px)] transition-transform duration-300 ease-in-out print:hidden translate-x-0 bg-slate-900/40 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden flex flex-col z-[999] border border-white/10`}
            style={{
                width,
                minWidth: '320px',
                maxWidth: '900px',
                marginLeft: '12px' // Explicit gap from sidebar
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close panel"
                >
                    <X size={20} className="text-gray-300" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>
        </div>
    );
}
