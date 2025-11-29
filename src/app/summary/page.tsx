"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useBookingStore } from "@/src/core/lib/store"
import { Navbar } from "@/src/core/components/layouts/navbar"
import { PriceBreakdownCard } from "@/src/core/components/ui/price-breakdown-card"
import { Button } from "@/src/core/components/ui/button"
import { ErrorBanner } from "@/src/core/components/ui/error-banner"
import { LoadingSpinner } from "@/src/core/components/ui/loading-spinner"
import { ArrowLeft, Plane, Clock, User, Mail, Phone, FileText, Globe, Calendar, AlertTriangle } from "lucide-react"

export default function SummaryPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { selectedFlight, searchParams, passengers } = useBookingStore()
  const [seatError, setSeatError] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!selectedFlight || !searchParams || passengers.length === 0) {
      router.push("/")
      return
    }

    // Simulate seat availability check
    const checkAvailability = () => {
      // 10% chance of seat unavailability for demo
      if (Math.random() < 0.1) {
        setSeatError(true)
      }
    }
    checkAvailability()
  }, [isAuthenticated, selectedFlight, searchParams, passengers, router])

  if (!isAuthenticated || !selectedFlight || !searchParams || passengers.length === 0) {
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
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to passenger info
            </button>
            <h1 className="text-3xl font-bold text-foreground">Booking Summary</h1>
            <p className="mt-2 text-muted-foreground">Review your booking details before payment</p>
          </div>

          {seatError && (
            <ErrorBanner
              message="Sorry, seat availability has changed. Please select a different flight."
              className="mb-6"
              onDismiss={() => router.push("/")}
            />
          )}

          {seatError ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Seats No Longer Available</h2>
              <p className="text-muted-foreground mb-6">
                The seats for your selected flight are no longer available. Please search for another flight.
              </p>
              <Button onClick={() => router.push("/")}>Search New Flights</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Flight Details */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Flight Details
                </h2>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedFlight.airline}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{selectedFlight.departureTime}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.origin}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{selectedFlight.duration}</span>
                      <div className="w-20 border-t border-dashed border-muted-foreground/40 mt-1" />
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{selectedFlight.arrivalTime}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.destination}</p>
                    </div>
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{searchParams.departureDate}</p>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Passengers ({passengers.length})
                </h2>
                <div className="space-y-4">
                  {passengers.map((passenger, index) => (
                    <div key={passenger.id} className="rounded-lg bg-muted/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{passenger.fullName}</span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {passenger.dateOfBirth}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          {passenger.nationality}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {passenger.passportNumber}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {passenger.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {passenger.phoneNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <PriceBreakdownCard flight={selectedFlight} passengerCount={searchParams.passengers} />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button variant="outline" onClick={() => router.push("/passengers")}>
                  Edit Passengers
                </Button>
                <Button onClick={() => router.push("/payment")} size="lg">
                  Confirm & Pay
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
