import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import {
	addTableToBookingSchema,
	completeBookingSchema,
	createBookingSchema,
	endTableInBookingSchema,
	getBookingsQuerySchema,
	updateBookingSchema,
} from "@/shared/schemas/booking";
import { BookingService } from "./service";

export const booking = new Elysia({ prefix: "/bookings" })
	.use(authorization)
	.post(
		"/",
		async ({ body }) => {
			return await BookingService.create(body);
		},
		{
			body: createBookingSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	.get(
		"/",
		async ({ query }) => {
			return await BookingService.getAll(query);
		},
		{
			query: getBookingsQuerySchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await BookingService.getById(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, user }) => {
			return await BookingService.update(id, body, user.id);
		},
		{
			body: updateBookingSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	// Add table to booking
	.post(
		"/:id/tables",
		async ({ params: { id }, body }) => {
			return await BookingService.addTable(id, body);
		},
		{
			body: addTableToBookingSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	// End table in booking
	.post(
		"/tables/end",
		async ({ body }) => {
			return await BookingService.endTable(body);
		},
		{
			body: endTableInBookingSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	)
	// Complete booking (checkout)
	.post(
		"/:id/complete",
		async ({ params: { id }, body, user }) => {
			return await BookingService.complete(id, body, user.id);
		},
		{
			body: completeBookingSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Bookings"],
			},
		},
	);
