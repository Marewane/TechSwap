import React from 'react';

const ProfileReviews = ({ reviews = [] }) => {
    return (
        <div className="bg-white rounded-lg border p-6">
            {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id || review._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-4">
                                <img
                                    src={review.reviewerAvatar}
                                    alt={review.reviewerName}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xl ${i < review.rating
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No reviews yet.</p>
                    <p className="text-gray-400 mt-2">Reviews from your sessions will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default ProfileReviews;


