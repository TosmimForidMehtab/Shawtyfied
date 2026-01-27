import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import Card from './ui/Card';

export const QuickActions = ({ quickActions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="group"
        >
          <Link to={action.path} className="block h-full">
            <Card className="h-full hover:border-indigo-200 transition-colors relative overflow-hidden group-hover:shadow-xl group-hover:shadow-indigo-500/10">
              <div className={`absolute top-0 right-0 w-24 h-24 ${action.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${action.color} text-white shadow-lg shadow-indigo-500/20`}>
                    <action.icon size={24} />
                  </div>
                  <div className="text-gray-300 group-hover:text-indigo-500 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {action.description}
                </p>

                <div className="flex items-center text-sm font-semibold text-indigo-600 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Explore now <ArrowUpRight size={14} className="ml-1" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};