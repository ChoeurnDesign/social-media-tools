// Icon configuration - centralized icon mapping for the application
import {
  LayoutDashboard,
  Users,
  Smartphone,
  Bot,
  TrendingUp,
  Video,
  Tag,
  Settings,
  Upload,
  Download,
  Music2,
  Bell,
  Sun,
  Moon,
  User,
  Search,
  X,
  Plus,
  Play,
  Square,
  RotateCw,
  ScrollText,
  Pause,
  Heart,
  BarChart3,
  Eye,
  Rocket,
  CheckCircle,
  Activity,
  Clock,
  Edit,
  Trash2,
  LogIn,
  Lock,
  FileText,
  MessageCircle,
  LogOut,
  EyeOff,
  ChevronRight,
  Lightbulb,
  Menu,
} from 'lucide-react';

// Sidebar navigation icons
export const sidebarIcons = {
  dashboard: LayoutDashboard,
  accounts: Users,
  instances: Smartphone,
  automation: Bot,
  analytics: TrendingUp,
  content: Video,
  tags: Tag,
  settings: Settings,
  export: Upload,
  logo: Music2,
  menu: Menu,
  close: X,
};

// Header icons
export const headerIcons = {
  search: Search,
  bell: Bell,
  sun: Sun,
  moon: Moon,
  user: User,
  close: X,
  settings: Settings,
  docs: FileText,
  support: MessageCircle,
  logout: LogOut,
};

// Dashboard stat card icons
export const statIcons = {
  users: Users,
  active: Activity,
  heart: Heart,
  chart: BarChart3,
  eye: Eye,
  rocket: Rocket,
};

// Quick action icons
export const actionIcons = {
  plus: Plus,
  bot: Bot,
  chart: BarChart3,
  tag: Tag,
  upload: Upload,
  smartphone: Smartphone,
};

// Instance controller icons
export const instanceIcons = {
  play: Play,
  stop: Square,
  refresh: RotateCw,
  scroll: ScrollText,
  pause: Pause,
  smartphone: Smartphone,
};

// Account card icons
export const accountIcons = {
  edit: Edit,
  delete: Trash2,
  login: LogIn,
  check: CheckCircle,
  rocket: Rocket,
};

// Activity icons
export const activityIcons = {
  check: CheckCircle,
  smartphone: Smartphone,
  bot: Bot,
  heart: Heart,
};

// Status icons
export const statusIcons = {
  visible: Eye,
  hidden: EyeOff,
  close: X,
};

// Form icons
export const formIcons = {
  edit: Edit,
  plus: Plus,
  lock: Lock,
};

// Info icons
export const infoIcons = {
  rocket: Rocket,
  lightbulb: Lightbulb,
};

// Icon wrapper component for consistent sizing
export const Icon = ({ icon: IconComponent, size = 20, className = '', ...props }) => {
  return <IconComponent size={size} className={className} {...props} />;
};

export default {
  sidebarIcons,
  headerIcons,
  statIcons,
  actionIcons,
  instanceIcons,
  accountIcons,
  activityIcons,
  statusIcons,
  formIcons,
  infoIcons,
  Icon,
};
