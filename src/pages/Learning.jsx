import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FileText,
  Download,
  Menu,
  X,
  Star,
  BookOpen,
  Clock,
  Users,
  Award,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../utils/api";

const Learning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width:1024px)").matches
      : false
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(0);
  const [currentLesson, setCurrentLesson] = useState({ section: 0, lesson: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  /* -------------------- LOAD COURSE -------------------- */

  useEffect(() => {
    const loadLessonData = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/courses/${courseId}/curriculum`);
        setCourse(data.course);
        setCompletedLessons(
          data.enrollment.progress.completed_lessons || []
        );
      } catch (err) {
        if (err.response?.status === 403) {
          alert("You must enroll first");
          navigate(`/courses/${courseId}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) loadLessonData();
  }, [courseId, navigate]);

  /* -------------------- RESPONSIVE -------------------- */

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.matchMedia("(min-width:1024px)").matches;
      setIsDesktop(desktop);
      if (!desktop) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------- CURRICULUM -------------------- */

  const curriculum = useMemo(() => {
    const raw = course?.curriculum;
    if (!raw) return [];

    if (Array.isArray(raw)) return raw;

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }, [course?.curriculum]);

  const totalLessons = useMemo(() => {
    return curriculum.reduce(
      (sum, section) => sum + (section?.lessons?.length || 0),
      0
    );
  }, [curriculum]);

  const activeLesson =
    curriculum?.[currentLesson.section]?.lessons?.[currentLesson.lesson];

  const linearLessons = useMemo(() => {
    const pointers = [];
    curriculum.forEach((section, sectionIndex) => {
      (section?.lessons || []).forEach((_, lessonIndex) => {
        pointers.push({ section: sectionIndex, lesson: lessonIndex });
      });
    });
    return pointers;
  }, [curriculum]);

  const currentLessonIndex = linearLessons.findIndex(
    (ptr) =>
      ptr.section === currentLesson.section &&
      ptr.lesson === currentLesson.lesson
  );

  const nextLessonPointer =
    currentLessonIndex !== -1 ? linearLessons[currentLessonIndex + 1] : null;
  const prevLessonPointer =
    currentLessonIndex > 0 ? linearLessons[currentLessonIndex - 1] : null;

  const activeLessonId = activeLesson
    ? activeLesson.id || `${currentLesson.section}-${currentLesson.lesson}`
    : null;
  const isCurrentLessonComplete = activeLessonId
    ? completedLessons.includes(activeLessonId)
    : false;

  const progress =
    totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

  const sidebarClasses = useMemo(() => {
    const base =
      "fixed lg:relative z-40 top-0 left-0 h-full bg-white border-r transition-all duration-300 overflow-hidden";
    const widthClasses = isDesktop
      ? sidebarOpen
        ? "w-0 lg:w-96"
        : "w-0 lg:w-0"
      : "w-80";
    const translateClasses = sidebarOpen ? "translate-x-0" : "-translate-x-full";
    const desktopTranslate = isDesktop
      ? sidebarOpen
        ? "lg:translate-x-0"
        : "lg:-translate-x-full"
      : "";

    return [base, widthClasses, translateClasses, desktopTranslate]
      .filter(Boolean)
      .join(" ");
  }, [isDesktop, sidebarOpen]);

  const pageBackgroundStyle = useMemo(
    () => ({
      background:
        "radial-gradient(140% 140% at 5% 0%, #ffffff 0%, #eef2f8 45%, #d7deea 80%, #c8cfdb 100%)",
    }),
    []
  );

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleLessonComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;

    const newList = [...completedLessons, lessonId];
    setCompletedLessons(newList);

    try {
      await api.post(`/courses/${courseId}/progress`, {
        completed_lessons: newList,
      });
    } catch {}
  };

  const goToLesson = (pointer) => {
    if (!pointer) return;
    setCurrentLesson(pointer);
  };

  const handleNextLesson = () => {
    goToLesson(nextLessonPointer);
  };

  const handlePrevLesson = () => {
    goToLesson(prevLessonPointer);
  };

  const handleMarkComplete = () => {
    if (!activeLessonId) return;
    if (!isCurrentLessonComplete) {
      handleLessonComplete(activeLessonId);
    }
  };

  /* -------------------- LOADING -------------------- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  /* -------------------- PAGE -------------------- */

  return (
    <div className="flex h-screen overflow-hidden text-slate-900" style={pageBackgroundStyle}>

      {/* SIDEBAR */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="p-4 border-b flex justify-between items-center">
            <Link
              to="/student/dashboard"
              className="flex items-center text-sm text-gray-600"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Link>

            {!isDesktop && (
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* COURSE PROGRESS */}
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-900 mb-3 line-clamp-2">
              {course.title}
            </h2>

            <div className="bg-gray-100 p-4 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-semibold text-blue-600">
                  {progress}%
                </span>
              </div>

              <div className="w-full h-2 bg-gray-300 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs mt-2 text-gray-500">
                <span>
                  {completedLessons.length}/{totalLessons} lessons
                </span>
                <span>{Math.round(totalLessons * 0.5)}h left</span>
              </div>
            </div>
          </div>

          {/* CURRICULUM */}
          <div className="flex-1 overflow-y-auto">

            {curriculum.map((section, sIndex) => (
              <div key={sIndex} className="border-b">

                <button
                  onClick={() => toggleSection(sIndex)}
                  className="w-full p-4 flex justify-between hover:bg-gray-50"
                >
                  <div className="text-left">
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-xs text-gray-500">
                      {section.lessons.length} lessons
                    </p>
                  </div>

                  <ChevronDown
                    className={`transition-transform ${
                      expandedSection === sIndex ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSection === sIndex &&
                  section.lessons.map((lesson, lIndex) => {
                    const isActive =
                      sIndex === currentLesson.section &&
                      lIndex === currentLesson.lesson;

                    const isComplete = completedLessons.includes(
                      lesson.id || `${sIndex}-${lIndex}`
                    );

                    return (
                      <button
                        key={lIndex}
                        onClick={() =>
                          setCurrentLesson({
                            section: sIndex,
                            lesson: lIndex,
                          })
                        }
                        className={`w-full p-3 pl-8 flex items-start gap-3
                        hover:bg-gray-100 border-l-2
                        ${
                          isActive
                            ? "border-blue-600 bg-blue-50"
                            : "border-transparent"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border rounded-full" />
                        )}

                        <div className="text-left">
                          <p className="text-sm">{lesson.title}</p>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.duration || "10m"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3">
              <Award className="text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Certificate</p>
                <p className="text-sm font-medium">Available at 100%</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu />
            </button>

            <h1 className="font-semibold truncate">
              {activeLesson?.title || "Lesson"}
            </h1>
          </div>

          <button
            onClick={handleNextLesson}
            disabled={!nextLessonPointer}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white transition
              ${nextLessonPointer ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">

          {/* VIDEO */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8">

            {activeLesson?.videoUrl && (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${
                  activeLesson.videoUrl.split("v=")[1]?.split("&")[0] ||
                  activeLesson.videoUrl.split("/").pop()
                }`}
                allowFullScreen
              />
            )}
          </div>

          {/* LESSON INFO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-3">
              About this lesson
            </h2>

            <p className="text-gray-600">
              {activeLesson?.description ||
                "In this lesson we will explore the fundamental concepts and practice with examples."}
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">

            <button
              onClick={handlePrevLesson}
              disabled={!prevLessonPointer}
              className={`flex items-center px-4 py-2 rounded-lg transition
                ${prevLessonPointer ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 cursor-not-allowed"}`}
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleMarkComplete}
              disabled={!activeLessonId || isCurrentLessonComplete}
              className={`flex items-center px-4 py-2 rounded-lg text-white transition
                ${!activeLessonId || isCurrentLessonComplete
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}`}
            >
              Mark Complete
              <CheckCircle className="ml-2 w-4 h-4" />
            </button>

          </div>

        </main>
      </div>
    </div>
  );
};

export default Learning;