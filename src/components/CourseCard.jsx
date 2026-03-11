import React from 'react';
import { Star, Users, Clock, TrendingUp, Award, BookOpen, PlayCircle, ChevronRight, GraduationCap } from 'lucide-react';

import UserAvatar from './UserAvatar';

const CourseCard = ({ course }) => {
    // Destructure with proper defaults
    const {
        title = '',
        description = '',
        category = '',
        level = '',
        instructor = { name: 'Instructor', avatar: '/default-avatar.jpg' },
        rating = 0,
        studentsCount,
        duration,
        price,
        originalPrice,
        discount = 0,
        image = '/default-course.jpg',
        isBestseller = false,
        isNew = false,
        lessonsCount = 0
    } = course;

    const rawPrice = price ?? course.price_etb ?? course.priceETB ?? course.amount;
    const rawOriginalPrice = originalPrice ?? course.original_price ?? course.original_price_etb ?? course.list_price;
    const numericPrice = Number(rawPrice);
    const numericOriginal = rawOriginalPrice != null ? Number(rawOriginalPrice) : null;
    const priceValue = Number.isFinite(numericPrice) ? numericPrice : 0;
    const originalValue = Number.isFinite(numericOriginal) ? numericOriginal : null;
    const hasDiscount = originalValue !== null && originalValue > priceValue;
    const displayPrice = hasDiscount ? priceValue : (priceValue ?? originalValue ?? 0);
    const comparePrice = hasDiscount ? originalValue : null;
    const computedDiscountPercent = hasDiscount && originalValue
        ? Math.round(((originalValue - priceValue) / originalValue) * 100)
        : 0;
    const durationText = duration ?? course.duration_text ?? course.total_duration ?? '';
    const numericDuration = Number(course.duration_hours ?? course.total_hours);
    const safeDuration = typeof durationText === 'string' && durationText.trim()
        ? durationText.trim()
        : (Number.isFinite(numericDuration) && numericDuration > 0 ? `${numericDuration}h` : '0h');
    const studentsValue = Number(course.studentsCount ?? studentsCount ?? course.students ?? course.students_count ?? 0);
    const lessonsValue = lessonsCount || course.lectures || course.lectures_count || 0;
    const imageSrc = image || course.thumbnail || '/default-course.jpg';

    return (
        <div className="group relative flex flex-col h-full bg-white rounded-xl border border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

            {/* Course Image */}
            <div className="relative overflow-hidden aspect-video bg-linear-to-br from-orange-50 to-white">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-white/20" />
                    </div>
                )}

                {/* Category Badge */}
                {category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-orange-400 border border-orange-400 text-xs font-semibold text-white">
                            {category}
                        </span>
                    </div>
                )}

                {/* Level Badge */}
                {level && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-normal text-gray-600">
                            {level}
                        </span>
                    </div>
                )}

                {/* Bestseller Badge */}
                {isBestseller && (
                    <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 rounded-md bg-linear-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white flex items-center gap-1 shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            BESTSELLER
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1 space-y-3">

                {/* Title & Description */}
                <div className="space-y-1.5">
                    <h3 className="text-[20px] font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
                        {title || 'Untitled Course'}
                    </h3>
                    <p className="text-sm text-gray-700 font-normal line-clamp-2 leading-relaxed">
                        {description || 'No description available'}
                    </p>
                </div>

                {/* Instructor & Rating */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            name={instructor?.name}
                            avatar={instructor?.avatar}
                            size="xs"
                            border={false}
                        />
                        <span className="text-sm text-gray-600 font-normal truncate max-w-[100px]">
                            {instructor?.name || 'Instructor'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-gray-900">{rating || 'New'}</span>
                        {studentsValue > 0 && (
                            <>
                                <span className="text-xs text-gray-600">·</span>
                                <span className="text-xs text-gray-600">
                                    {studentsValue} students
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Course Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-600 font-normal py-2 border-y border-orange-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{safeDuration}</span>
                    </div>
                    {lessonsValue > 0 && (
                        <>
                            <div className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{lessonsValue} lessons</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer - Price & CTA */}
                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[18px] font-bold text-gray-900">
                                {displayPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-600 uppercase tracking-wider">
                                ETB
                            </span>
                        </div>
                        {hasDiscount && comparePrice !== null && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 line-through">
                                    {comparePrice.toFixed(2)}
                                </span>
                                <span className="text-[9px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">
                                    {computedDiscountPercent || Math.round((discount || 0) * 100)}% OFF
                                </span>
                            </div>
                        )}
                    </div>

                    <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-400 text-white hover:opacity-90 transition-colors shadow-lg shadow-orange-200 flex items-center gap-1">
                        Enroll
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Free Course Badge */}
                {priceValue === 0 && (
                    <div className="absolute bottom-4 left-4">
                        <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                            FREE
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(CourseCard);