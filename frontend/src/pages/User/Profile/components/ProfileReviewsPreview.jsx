import React from 'react';

const ProfileReviewsPreview = ({ reviews = [], onViewAll }) => {
    const preview = (reviews || []).slice(0, 3);
    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Reviews</h3>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="text-sm text-blue-600 hover:underline"
                >
                    View all
                </button>
            </div>
            {preview.length > 0 ? (
                <div className="space-y-4">
                    {preview.map((review) => (
                        <div key={review.id || review._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <img
                                    src={review.reviewerAvatar}
                                    alt={review.reviewerName}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{review.reviewerName}</p>
                                    <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No reviews yet.</p>
            )}
        </div>
    );
};

export default ProfileReviewsPreview;


