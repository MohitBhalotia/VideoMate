import React from 'react';

const UserAvatar = ({ name, size = 'medium' }) => {
    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate a consistent color based on the name
    const getColorFromName = (name) => {
        if (!name) return '#6B7280'; // Default gray color

        // List of visually pleasing colors
        const colors = [
            '#4F46E5', // Indigo
            '#10B981', // Emerald
            '#F59E0B', // Amber
            '#EF4444', // Red
            '#8B5CF6', // Violet
            '#EC4899', // Pink
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#6366F1', // Indigo
            '#14B8A6', // Teal
        ];

        // Create a simple hash from the name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Use the hash to select a color
        return colors[Math.abs(hash) % colors.length];
    };

    // Size classes
    const sizeClasses = {
        small: 'w-8 h-8 text-xs',
        medium: 'w-12 h-12 text-sm',
        large: 'w-16 h-16 text-lg',
    };

    const bgColor = getColorFromName(name);
    const initials = getInitials(name);
    const sizeClass = sizeClasses[size] || sizeClasses.medium;

    return (
        <div
            className={`${sizeClass} rounded-full flex items-center justify-center text-white font-medium`}
            style={{ backgroundColor: bgColor }}
        >
            {initials}
        </div>
    );
};

export default UserAvatar; 