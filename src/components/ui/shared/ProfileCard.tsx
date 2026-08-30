import { CheckIcon, PencilIcon, XIcon } from "lucide-react";

const ProfileCard = ({
  children,
  title,
  icon: Icon,
  sectionKey,
  canEdit,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  loading,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  sectionKey: string;
  canEdit: boolean;
  isEditing: string | null;
  onEdit: (section: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div
    className={`p-6 rounded-xl shadow-lg transition-colors duration-300 ${
      isEditing === sectionKey
        ? "bg-blue-50 dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600"
        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    }`}
  >
    <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
        <Icon className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
        {title}
      </h3>
      {canEdit &&
        (isEditing === sectionKey ? (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              disabled={loading}
              className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              title="Save Changes"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-2 rounded-full text-gray-500 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
              title="Cancel"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(sectionKey)}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700 transition"
            title="Edit Section"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        ))}
    </div>
    {children}
  </div>
);

export default ProfileCard;
