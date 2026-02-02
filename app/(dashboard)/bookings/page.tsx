"use client";

import { Calendar as CalendarIcon, Clock, Phone, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingsPage() {
	const [date, setDate] = useState<Date | undefined>(new Date());

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Quản lý đặt bàn</h1>
				<p className="text-gray-600">Theo dõi và quản lý lịch đặt bàn</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Calendar */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Lịch đặt bàn</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col space-y-8 sm:flex-row sm:space-x-8 sm:space-y-0">
								<Calendar
									mode="single"
									selected={date}
									onSelect={setDate}
									className="rounded-md border"
								/>
								<div className="flex-1 space-y-4">
									<h3 className="font-semibold">Đặt bàn trong ngày</h3>
									<div className="space-y-3">
										{[1, 2, 3].map((item) => (
											<div key={item} className="rounded-lg border p-4">
												<div className="flex items-center justify-between">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<Clock className="h-4 w-4 text-gray-500" />
															<span className="font-medium">14:00 - 16:00</span>
														</div>
														<div className="flex items-center gap-2">
															<User className="h-4 w-4 text-gray-500" />
															<span>Nguyễn Văn A</span>
														</div>
														<div className="flex items-center gap-2">
															<Phone className="h-4 w-4 text-gray-500" />
															<span>0987654321</span>
														</div>
													</div>
													<div className="text-right">
														<div className="font-medium">Bàn 3, 5</div>
														<div className="text-sm text-gray-500">4 người</div>
														<Button
															size="sm"
															variant="outline"
															className="mt-2"
														>
															Chi tiết
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Thao tác nhanh</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button className="w-full">
								<CalendarIcon className="mr-2 h-4 w-4" />
								Đặt bàn mới
							</Button>
							<Button variant="outline" className="w-full">
								Kiểm tra bàn trống
							</Button>
							<Button variant="outline" className="w-full">
								Xem đặt bàn hôm nay
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Thống kê hôm nay</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-gray-600">Tổng đặt bàn:</span>
								<span className="font-medium">12</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Đang sử dụng:</span>
								<span className="font-medium">8</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Sắp hết giờ:</span>
								<span className="font-medium">3</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
