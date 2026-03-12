import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsQR from "jsqr";
import QrScanner from "qr-scanner";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";

const DEFAULT_ACCOUNT_NUMBER = "1000123456789";

const DetailCard = ({ title, items = [] }) => (
  <div className="rounded-2xl border border-indigo-50 bg-white/80 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-400">{title}</p>
    <dl className="mt-3 space-y-2">
      {items.map((item) => (
        <div key={`${title}-${item.label}`}>
          <dt className="text-xs text-gray-500">{item.label}</dt>
          <dd className="text-sm font-medium text-gray-900 break-words">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [qrStatus, setQrStatus] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [accountNumber, setAccountNumber] = useState(DEFAULT_ACCOUNT_NUMBER);
  const [paymentSession, setPaymentSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);
  

  const fallbackReference = courseId?.slice(0, 8) || "REFCODE";
  const referenceNumber = paymentSession?.referenceCode || course?.referenceCode || fallbackReference;
  const fallbackPrice = 100000;
  const priceSource = paymentSession?.amount ?? course?.price;
  const parsedPrice = Number(priceSource);
  const coursePriceValue = Number.isFinite(parsedPrice) ? parsedPrice : fallbackPrice;
  const formattedCoursePrice = coursePriceValue.toLocaleString();
  const instructorName = teacher?.name || course?.instructor?.name || "Hussen";
  const instructorAvatar = teacher?.avatar || course?.instructor?.avatar;
  const teacherEmail = teacher?.email || course?.instructor?.email || "";
  const teacherId = teacher?.id || course?.instructor?.id || "—";
  const courseTitle = course?.title || "Selected Course";
  const courseImage =
    course?.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop";
  const studentName = studentRecord?.name || user?.name || "Student";
  const studentEmail = studentRecord?.email || user?.email || "";
  const studentId = studentRecord?.id || user?.id || "—";
  const displayAccountNumber = teacher?.accountNumber || accountNumber || DEFAULT_ACCOUNT_NUMBER;
  const courseIdentifier = course?.id || courseId || "—";
  const teacherSummaryItems = [
    { label: "Name", value: instructorName },
    { label: "Email", value: teacherEmail || "Not provided" },
    { label: "Instructor ID", value: teacherId },
    { label: "Account #", value: displayAccountNumber },
  ];
  const studentSummaryItems = [
    { label: "Name", value: studentName },
    { label: "Email", value: studentEmail || "Not provided" },
    { label: "Student ID", value: studentId },
  ];
  const courseSummaryItems = [
    { label: "Course Title", value: courseTitle },
    { label: "Course ID", value: courseIdentifier },
    { label: "Reference Code", value: referenceNumber },
    { label: "Category", value: course?.category || "Not specified" },
    { label: "Amount", value: `${formattedCoursePrice} ETB` },
  ];

  const getImageDataFromFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const decodeWithJsQrFallback = async (file) => {
    const imageData = await getImageDataFromFile(file);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (!code?.data) {
      throw new Error("No QR payload detected");
    }
    return code.data;
  };

  const readTransactionFromQr = async (file) => {
    setQrStatus({ type: "info", message: "Scanning QR code..." });

    try {
      const scanResult = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      const qrText =
        typeof scanResult === "string" ? scanResult : scanResult?.data;
      if (qrText?.trim()) {
        return qrText.trim();
      }
      throw new Error("Empty QR response");
    } catch (primaryError) {
      console.warn("QrScanner failed, using jsQR fallback", primaryError);
      return decodeWithJsQrFallback(file);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0] || null;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setScreenshot(file);
    setQrStatus(null);

    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const detectedId = await readTransactionFromQr(file);
      setTransactionId(detectedId);
      console.log("QR detected transaction ID:", detectedId);
      setQrStatus({
        type: "success",
        message: "QR detected. Transaction ID filled automatically.",
      });
    } catch (err) {
      console.error("QR decoding failed", err);
      setQrStatus({
        type: "error",
        message: "Could not read QR code. Please enter the transaction ID manually.",
      });
    }
  };

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);

    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleVerify = async () => {
    if (!paymentSession?.referenceCode) {
      setVerifyStatus({ type: "error", message: "No active payment session. Please refresh and try again." });
      return;
    }

    if (!screenshot) {
      setVerifyStatus({ type: "error", message: "Upload the bank receipt screenshot first." });
      return;
    }

    if (!transactionId.trim()) {
      setVerifyStatus({ type: "error", message: "Enter or scan the transaction ID before verifying." });
      return;
    }

    const suffix = (displayAccountNumber || "").slice(-8);
    if (!suffix || suffix.length < 4) {
      setVerifyStatus({ type: "error", message: "Missing instructor account information. Please reload the page." });
      return;
    }

    setLoading(true);
    setVerifyStatus(null);

    try {
      const formData = new FormData();
      formData.append("courseId", courseId || courseIdentifier);
      formData.append("referenceCode", paymentSession.referenceCode);
      formData.append("transactionId", transactionId.trim());
      formData.append("accountSuffix", suffix);
      formData.append("receipt", screenshot);

      const { data } = await api.post("/payments/verify-payment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVerifyStatus({ type: "success", message: data?.message || "Payment verified! Redirecting..." });
      setTimeout(() => {
        navigate(`/learning/${courseId}`);
      }, 1500);
    } catch (err) {
      const status = err?.response?.status;
      const type = status === 410 ? "warning" : "error";
      const message = err?.response?.data?.error || "Verification failed. Please try again.";
      setVerifyStatus({ type, message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) {
      setCourseLoading(false);
      return;
    }

    let isMounted = true;
    const applyPayload = (payload) => {
      if (!isMounted || !payload) return;
      const normalizedCourse = payload.course ?? payload;
      if (normalizedCourse) {
        setCourse(normalizedCourse);
        const instructorPayload = payload.instructor ?? normalizedCourse?.instructor ?? null;
        setTeacher(instructorPayload || null);
        setAccountNumber(instructorPayload?.accountNumber || DEFAULT_ACCOUNT_NUMBER);
      }
      setStudentRecord(payload.student ?? null);
    };

    const loadCourse = async () => {
      setCourseLoading(true);
      setCourseError(null);
      try {
        const { data } = await api.get(`/courses/${courseId}/checkout`);
        applyPayload(data);
      } catch (err) {
        if (err?.response?.status === 401) {
          try {
            const { data } = await api.get(`/courses/${courseId}`);
            applyPayload({ course: data });
          } catch (innerErr) {
            if (!isMounted) return;
            console.error("Failed to load course", innerErr);
            setCourseError(
              innerErr?.response?.data?.error || "Failed to load course information. Please try again."
            );
          }
        } else {
          if (!isMounted) return;
          console.error("Failed to load course", err);
          setCourseError(
            err?.response?.data?.error || "Failed to load course information. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setCourseLoading(false);
        }
      }
    };

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !user) {
      return;
    }

    let isMounted = true;
    const createSession = async () => {
      setSessionLoading(true);
      setSessionError(null);
      try {
        const { data } = await api.post('/payments/create-payment', { courseId });
        if (!isMounted) return;
        setPaymentSession(data);
      } catch (err) {
        if (!isMounted) return;
        if (err?.response?.status === 409 && err?.response?.data?.accessGranted) {
          navigate(`/learning/${courseId}`);
          return;
        }
        setSessionError(err?.response?.data?.error || 'Failed to initialize payment session.');
      } finally {
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    };

    createSession();
    return () => {
      isMounted = false;
    };
  }, [courseId, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start p-4 sm:p-6">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
        <div className="w-full lg:w-5/12 space-y-6">
          {course && (
            <>
              <div className="grid grid-cols-1 items-start gap-4 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-inner sm:grid-cols-[120px,1fr]">
            <div className="overflow-hidden rounded-xl bg-gray-100">
              <img
                src={courseImage}
                alt={courseTitle}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Course</p>
                <h2 className="text-xl font-semibold text-gray-900">{courseTitle}</h2>
                {course?.category && (
                  <p className="text-sm text-gray-500">Category: {course.category}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {instructorAvatar ? (
                    <img
                      src={instructorAvatar}
                      alt={instructorName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-center text-xs font-semibold leading-8 text-indigo-600">
                      {instructorName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Instructor</p>
                    <p className="font-medium text-gray-800">{instructorName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Student</p>
                  <p className="font-medium text-gray-800">{studentName}</p>
                  {studentEmail && <p className="text-xs text-gray-500">{studentEmail}</p>}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Amount</p>
                  <p className="font-semibold text-gray-900">{formattedCoursePrice} ETB</p>
                </div>
              </div>
            </div>
          </div>
          
          </>
         )}

            
        </div>

        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 border      border-gray-100">
        {/* Header with Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-100 p-3 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 lg:text-xl">Complete Your Payment</h1>
        </div>

        {courseLoading && (
          <div className="mb-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-700">
            Loading course details...
          </div>
        )}
        {courseError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {courseError}
          </div>
        )}
        {sessionLoading && (
          <div className="mb-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700">
            Initializing payment session...
          </div>
        )}
        {sessionError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {sessionError}
          </div>
        )}
        

        {/* Payment Instructions - Enhanced with better styling */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[2rem] mb-4 text-red-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment Instructions
          </h2>

          <div className="space-y-3">
            {[
              { icon: "1️⃣", text: "Send payment using ", bold: "CBE Mobile Banking" },
              { icon: "2️⃣", text: "Send to Account: ", bold: displayAccountNumber, copy: true, field: "account" },
              { icon: "3️⃣", text: "Use this code in the reason section: ", bold: referenceNumber, copy: true, field: "reference" },
              { icon: "4️⃣", text: "Take a screenshot after transaction" },
              { icon: "5️⃣", text: "Upload screenshot below and verify" },
              { icon: "6️⃣", text: "Wait for verification (3-5 seconds)" },
            ].map((item, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-3 text-gray-700">
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-base">
                  {item.text}
                  <span className="font-semibold text-indigo-700">{item.bold}</span>
                </span>
                {item.copy && (
                  <button
                    onClick={() => copyText(item.bold, item.field)}
                    className="relative group"
                  >
                    {copiedField === item.field ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              After sending the payment, take a clear screenshot and upload it below
            </p>
          </div>
        </div>

        {/* Payment Details Card - Enhanced */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="bg-indigo-100 p-1 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            Instructor: {instructorName}
          </h3>

          <div className="space-y-4">
            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Amount (ETB)</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ETB</span>
                  <input
                    type="text"
                    value={formattedCoursePrice}
                    readOnly
                    className="w-full pl-12 border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 font-semibold focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  onClick={() => copyText(String(coursePriceValue), "amount")}
                  className="w-full sm:w-auto p-3 border-2 border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition group flex items-center justify-center"
                >
                  {copiedField === "amount" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Reference</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={referenceNumber}
                  readOnly
                  className="flex-1 border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 focus:border-indigo-500 transition"
                />
                <button
                  onClick={() => copyText(referenceNumber, "description")}
                  className="w-full sm:w-auto p-3 border-2 border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition group flex items-center justify-center"
                >
                  {copiedField === "description" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            


            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Account number</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={displayAccountNumber}
                  readOnly
                  className="flex-1 border-2 border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700 focus:border-indigo-500 transition"
                />
                <button
                  onClick={() => copyText(displayAccountNumber, "accountNumber")}
                  className="w-full sm:w-auto p-3 border-2 border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition group flex items-center justify-center"
                >
                  {copiedField === "accountNumber" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Upload - Enhanced */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Upload Payment Screenshot
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-indigo-400 transition cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
              ref={fileInputRef}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* Preview - Enhanced */}
        {preview && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Preview</p>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">✓ Image selected</span>
            </div>
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="rounded-xl border-2 border-indigo-200 max-h-64 w-full max-w-md object-contain mx-auto"
              />
              <button 
                onClick={() => {
                  setScreenshot(null);
                  if (preview) {
                    URL.revokeObjectURL(preview);
                  }
                  setPreview(null);
                  setQrStatus(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Verify Button - Enhanced */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <span>Verify Payment</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>

        {verifyStatus && (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              verifyStatus.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : verifyStatus.type === "warning"
                ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {verifyStatus.message}
          </div>
        )}

        {/* Security Note */}
        <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your payment information is secure and encrypted
        </p>
      </div>


        </div>

        <div>

            
        </div>

      
    </div>
  );
};

export default Checkout;