import PDFDocument from "pdfkit"
import { Response } from "express"

export interface BookingPDFData {
  bookingId: string
  touristName: string
  touristEmail: string
  activityTitle: string
  category: string
  location: string
  bookingDate: string
  participants: number
  pricePerPerson: number
  totalPrice: number
  status: string
}

export const generateBookingPDF = (data: BookingPDFData, res: Response): void => {
  const doc = new PDFDocument({ margin: 50 })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Booking-${data.bookingId}.pdf`
  )

  doc.pipe(res)

  // Header
  doc
    .fillColor("#0070f3")
    .fontSize(24)
    .text("Sri Lanka Tourist Activity Platform", { align: "center" })
    .moveDown(0.5)

  doc
    .fillColor("#333333")
    .fontSize(16)
    .text("Booking Confirmation & Ticket", { align: "center" })
    .moveDown(1.5)

  // Horizontal line
  doc
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown(1)

  // Booking Info
  doc.fontSize(12).fillColor("#111111")
  doc.text(`Booking Reference ID: ${data.bookingId}`)
  doc.text(`Booking Status: ${data.status.toUpperCase()}`)
  doc.text(`Issued Date: ${new Date().toLocaleDateString()}`)
  doc.moveDown(1)

  // Tourist Info Section
  doc.fontSize(14).fillColor("#0070f3").text("Customer Information")
  doc.moveDown(0.5)
  doc.fontSize(11).fillColor("#333333")
  doc.text(`Name: ${data.touristName}`)
  doc.text(`Email: ${data.touristEmail}`)
  doc.moveDown(1)

  // Activity Details Section
  doc.fontSize(14).fillColor("#0070f3").text("Activity Details")
  doc.moveDown(0.5)
  doc.fontSize(11).fillColor("#333333")
  doc.text(`Activity: ${data.activityTitle}`)
  doc.text(`Category: ${data.category}`)
  doc.text(`Location: ${data.location}`)
  doc.text(`Activity Date: ${data.bookingDate}`)
  doc.text(`Participants: ${data.participants}`)
  doc.text(`Rate: LKR ${data.pricePerPerson.toLocaleString()} per person`)
  doc.moveDown(1)

  // Payment Summary Section
  doc.fontSize(14).fillColor("#0070f3").text("Payment Summary")
  doc.moveDown(0.5)
  doc.fontSize(13).fillColor("#000000")
  doc.text(`Total Amount Paid: LKR ${data.totalPrice.toLocaleString()}`, { bold: true } as any)
  doc.moveDown(2)

  // Footer / Instructions
  doc
    .strokeColor("#e0e0e0")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown(1)

  doc
    .fontSize(10)
    .fillColor("#666666")
    .text(
      "Please present this ticket/receipt to the activity provider on the day of the activity. Enjoy your experience in Sri Lanka!",
      { align: "center" }
    )

  doc.end()
}
