"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/core/lib/store"
import { Navbar } from "@/src/core/components/layouts/navbar"
import { Button } from "@/src/core/components/ui/button"
import { LoadingSpinner } from "@/src/core/components/ui/loading-spinner"
import { mockBookings } from "@/src/core/lib/mock-data"
import { Plane, Clock, Calendar, TicketCheck, ArrowRight, Search } from "lucide-react"
import Link from "next/link"

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">View and manage your flight bookings</p>
          </div>

          {mockBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                <TicketCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">{"You haven't made any flight bookings yet"}</p>
              <Link href="/">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Flights
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{booking.flight.flightNumber}</span>
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.flight.airline}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {booking.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{booking.flight.departureTime}</p>
                        <p className="text-sm text-muted-foreground">{booking.flight.origin.split(" ")[0]}</p>
                      </div>

                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{booking.flight.duration}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{booking.flight.arrivalTime}</p>
                        <p className="text-sm text-muted-foreground">{booking.flight.destination.split(" ")[0]}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">
                        PNR: <span className="font-mono">{booking.pnr}</span>
                      </p>
                      <p className="text-lg font-bold text-foreground">${booking.totalPrice}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.passengers.length} passenger
                        {booking.passengers.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
