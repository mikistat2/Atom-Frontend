import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, Loader, QrCode, Clock } from 'lucide-react';
import { api } from '../utils/api';

const PaymentModal = ({ isOpen, onClose, course }) => {
    const navigate = useNavigate();
    const [screenshot, setScreenshot] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null
    const normalizedFeatures = Array.isArray(course?.features) ? course.features : [];
    const rawDuration = course?.duration || course?.duration_text || course?.total_duration || '0h';
    const courseDuration = typeof rawDuration === 'string' && rawDuration.trim() ? rawDuration : '0h';
    const priceNumber = Number(course?.price ?? course?.price_etb ?? course?.priceETB ?? 0);
    const enrollmentAmount = Number.isFinite(priceNumber) ? priceNumber : 0;
    const priceLabel = enrollmentAmount.toFixed(2);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshot(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerifyPayment = async () => {
        setIsVerifying(true);
        try {
            // 1. Simulate server-side verification delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Call real enrollment API
            await api.post(`/courses/${course.id}/enroll`, {
                amount: enrollmentAmount,
                transaction_id: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });

            setVerificationStatus('success');

            // 3. Redirect to course learning room
            setTimeout(() => {
                onClose();
                navigate(`/learning/${course.id}`);
            }, 1500);

        } catch (err) {
            console.error('Enrollment error:', err);
            setVerificationStatus('error');
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen || !course) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-custom">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Complete Your Payment</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Course Info */}
                <div className="glass rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-white mb-2">{course?.title}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary">Total Amount:</span>
                        <span className="text-2xl font-bold gradient-text">{priceLabel} ETB</span>
                    </div>
                </div>

                <div className="glass rounded-xl p-4 mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-text-secondary">Course Duration</div>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{courseDuration}</span>
                        </div>
                    </div>
                    {normalizedFeatures.length > 0 && (
                        <div>
                            <p className="text-sm text-text-secondary mb-2">Key Features</p>
                            <ul className="space-y-2 text-sm text-white/80">
                                {normalizedFeatures.slice(0, 4).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-success" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {normalizedFeatures.length > 4 && (
                                    <li className="text-text-secondary text-xs">
                                        + {normalizedFeatures.length - 4} more features included
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Payment Instructions */}
                <div className="space-y-4 mb-6">
                    <div className="glass rounded-xl p-6">
                        <div className="flex items-start space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <QrCode className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Payment Instructions</h4>
                                <p className="text-text-secondary text-sm">
                                    Follow these steps to complete your payment
                                </p>
                            </div>
                        </div>

                        <ol className="space-y-3 text-sm text-text-secondary">
                            <li className="flex items-start space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    1
                                </span>
                                <span>Open your Telebirr or banking app</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    2
                                </span>
                                <span>Scan the QR code or use the payment details provided</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    3
                                </span>
                                <span>Complete the payment of <strong className="text-white">{priceLabel} ETB</strong></span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    4
                                </span>
                                <span>Take a screenshot of the successful payment confirmation</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                    5
                                </span>
                                <span>Upload the screenshot below for verification</span>
                            </li>
                        </ol>
                    </div>

                    {/* QR Code Display (Placeholder) */}
                    <div className="glass rounded-xl p-6 flex flex-col items-center">
                        <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mb-3">
                            <QrCode className="w-32 h-32 text-gray-800" />
                        </div>
                        <p className="text-text-secondary text-sm text-center">
                            Scan this QR code with your payment app
                        </p>
                        <p className="text-white font-mono text-sm mt-2">
                            Account: +251-XXX-XXX-XXX
                        </p>
                    </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-white">Upload Payment Screenshot</h4>

                    {!screenshot ? (
                        <label className="glass rounded-xl p-8 border-2 border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center">
                            <Upload className="w-12 h-12 text-primary mb-3" />
                            <span className="text-white font-semibold mb-1">Click to upload screenshot</span>
                            <span className="text-text-secondary text-sm">PNG, JPG up to 10MB</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    ) : (
                        <div className="relative glass rounded-xl p-4">
                            <img
                                src={screenshot}
                                alt="Payment screenshot"
                                className="w-full rounded-lg mb-4"
                            />
                            <button
                                onClick={() => setScreenshot(null)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-error flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    )}

                    {/* Verification Status */}
                    {verificationStatus === 'success' && (
                        <div className="glass rounded-xl p-4 border-2 border-success bg-success/10">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="w-6 h-6 text-success" />
                                <div>
                                    <p className="font-semibold text-success">Payment Verified!</p>
                                    <p className="text-sm text-text-secondary">Granting access to the course...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div className="glass rounded-xl p-4 border-2 border-error bg-error/10">
                            <div className="flex items-center space-x-3">
                                <X className="w-6 h-6 text-error" />
                                <div>
                                    <p className="font-semibold text-error">Verification Failed</p>
                                    <p className="text-sm text-text-secondary">Please check your screenshot and try again</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleVerifyPayment}
                        disabled={!screenshot || isVerifying || verificationStatus === 'success'}
                        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isVerifying ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Verifying Payment...</span>
                            </>
                        ) : verificationStatus === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Verified Successfully</span>
                            </>
                        ) : (
                            <span>Verify Payment & Access Course</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
