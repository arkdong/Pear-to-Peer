import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { useRouteError } from "@remix-run/react";
import { isRouteErrorResponse } from "@remix-run/react";

// Style imports
import "app/style/style.css";

// Component imports
import NavBar from "app/components/navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>

        <NavBar />

        {children}

        <ScrollRestoration />
        <Scripts />

      </body>
    </html>
  );
}

export default function App() {
  return (
    <Outlet />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{error?.message ?? "Unknown error"}</p>
    </>
  );
}
