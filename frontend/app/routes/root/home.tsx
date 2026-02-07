import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tasco" },
    { name: "description", content: "Welcome to Tasco!" },
  ];
}

const Homepage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col sm:flex-row items-center justify-center gap-4 p-4">
      <Link to="/sign-in" className="w-full sm:w-auto">
        <Button className="w-full sm:w-auto bg-blue-500 text-white">Login</Button>
      </Link>
      <Link to="/sign-up" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto bg-blue-500 text-white">
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

export default Homepage;
