import MainLayout from "@/components/layout/MainLayout";
import { FaClipboardList, FaBookOpen, FaLayerGroup, FaRegFolderOpen, FaChartLine, FaUsers, FaClock, FaCheckCircle } from "react-icons/fa";

export default function Home() {
  const stats = [
    {
      title: "Total Exams",
      value: "6",
      icon: <FaClipboardList className="text-2xl text-blue-600" />,
      description: "Active exam configurations",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Subjects",
      value: "3",
      icon: <FaBookOpen className="text-2xl text-green-600" />,
      description: "Available subjects",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Units",
      value: "1",
      icon: <FaLayerGroup className="text-2xl text-purple-600" />,
      description: "Organized units",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Chapters",
      value: "0",
      icon: <FaRegFolderOpen className="text-2xl text-orange-600" />,
      description: "Learning chapters",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  const features = [
    {
      title: "Exam Management",
      description: "Create and manage different types of exams including JEE, NEET, SAT, IB, AP, and CBSE",
      icon: <FaClipboardList className="text-xl text-blue-600" />,
      href: "/exam"
    },
    {
      title: "Subject Organization",
      description: "Organize subjects under each exam with detailed descriptions and metadata",
      icon: <FaBookOpen className="text-xl text-green-600" />,
      href: "/subjects"
    },
    {
      title: "Unit Structure",
      description: "Create hierarchical unit structures to organize learning content systematically",
      icon: <FaLayerGroup className="text-xl text-purple-600" />,
      href: "/units"
    },
    {
      title: "Chapter Management",
      description: "Manage chapters within units with drag-and-drop reordering capabilities",
      icon: <FaRegFolderOpen className="text-xl text-orange-600" />,
      href: "/chapters"
    },
    {
      title: "Topic Organization",
      description: "Break down chapters into specific topics for detailed content management",
      icon: <FaRegFolderOpen className="text-xl text-indigo-600" />,
      href: "/topics"
    },
    {
      title: "Sub-Topic Details",
      description: "Create granular sub-topics for comprehensive learning material organization",
      icon: <FaRegFolderOpen className="text-xl text-pink-600" />,
      href: "/sub-topics"
    }
  ];

  const recentActivities = [
    {
      action: "Exam Created",
      item: "CBSE Exam",
      time: "2 hours ago",
      icon: <FaCheckCircle className="text-green-500" />
    },
    {
      action: "Subject Added",
      item: "Organic Chemistry",
      time: "4 hours ago",
      icon: <FaCheckCircle className="text-green-500" />
    },
    {
      action: "Unit Updated",
      item: "Unit 1",
      time: "1 day ago",
      icon: <FaCheckCircle className="text-blue-500" />
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-gray-700 text-lg">
                Manage your comprehensive exam preparation platform with ease
              </p>
              <p className="text-gray-600 mt-2">
                Organize exams, subjects, units, chapters, topics, and sub-topics from this centralized admin panel.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl text-blue-200">📚</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-lg shadow-sm border p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              System Overview
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time statistics of your educational content
            </p>
          </div>
          <div className="p-6">
 
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Management Features
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive tools for organizing your educational content
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <a
                  key={index}
                  href={feature.href}
                  className="group block p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaClock className="text-green-600" />
              Recent Activity
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Latest changes and updates in your system
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {activity.action}: <span className="text-blue-600">{activity.item}</span>
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FaUsers className="text-purple-600" />
              Quick Actions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Get started with common tasks
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/exam"
                className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <FaClipboardList className="text-2xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Create New Exam</h3>
                  <p className="text-sm text-gray-600">Add a new exam configuration</p>
                </div>
              </a>
              <a
                href="/subjects"
                className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                <FaBookOpen className="text-2xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Add Subject</h3>
                  <p className="text-sm text-gray-600">Create a new subject</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
