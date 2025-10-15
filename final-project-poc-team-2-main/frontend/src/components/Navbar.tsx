import { Link } from "react-router-dom";
import { useAuth } from "../hooks/UserContext";

import { useEffect } from "react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Navbar() {
  const { isAuthenticated, user, checkAuthStatus, logout } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <nav className="bg-white shadow-md border-b border-neutral-300 mx-auto">
      <div className="p-4 mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img src="/logoImage.png" alt="Logo" className="h-10 w-10" />
          </Link>
        </div>
        <div className="flex items-center">
          <div>
            <Link
              to="/allclothing"
              className="text-lg text-black-600 hover:underline mr-4"
            >
              All Clothing
            </Link>
          </div>
          <div>
            <Link
              to="/wishlist"
              className="text-lg text-black-600 hover:underline mr-4"
            >
              Wishlist
            </Link>
          </div>
          <div>
            <Link
              to="/survey"
              className="text-lg text-black-600 hover:underline mr-4"
            >
              <Button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-md">
                Survey
              </Button>
            </Link>
          </div>
         {/* <div>
            <Link
              to="/curatedclothing"
              className="text-lg text-black-600 hover:underline mr-4"
            >
              Curated Clothing
            </Link>
          </div>*/}
          <div>
            {isAuthenticated ? (
              <Popover>
                <PopoverTrigger className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-100 shadow-md hover:shadow-sm">
                  {user?.email}
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Button
                    className="w-full bg-transparent text-neutral-900 hover:bg-gray-200 p-0"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                to="/login"
                className="text-lg text-blue-600 hover:underline"
              >
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
