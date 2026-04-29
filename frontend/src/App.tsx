import { Stack } from "@mantine/core";
import "./App.css";
import { Header } from "./components/layout/Header";
import { useRouter } from "./hooks/useRouter";
import { BookingPage } from "./pages/BookingPage";
import { EventsPage } from "./pages/EventsPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OwnerBookingsPage } from "./pages/OwnerBookingsPage";
import { OwnerEventTypesPage } from "./pages/OwnerEventTypesPage";

function App() {
  const { path, navigate } = useRouter();

  let page = <NotFoundPage navigate={navigate} />;

  if (path === "/") {
    page = <LandingPage navigate={navigate} />;
  } else if (path === "/events") {
    page = <EventsPage navigate={navigate} />;
  } else if (path.startsWith("/events/")) {
    page = <BookingPage eventTypeId={path.replace("/events/", "")} navigate={navigate} />;
  } else if (path === "/owner/event-types") {
    page = <OwnerEventTypesPage />;
  } else if (path === "/owner/bookings") {
    page = <OwnerBookingsPage navigate={navigate} />;
  }

  return (
    <Stack gap={0} className="app-shell">
      <Header path={path} navigate={navigate} />
      {page}
    </Stack>
  );
}

export default App;
