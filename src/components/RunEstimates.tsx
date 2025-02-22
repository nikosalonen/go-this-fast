import type React from "react";
import { useState } from "react";

export interface TimeInput {
	hours: number;
	minutes: number;
	seconds: number;
}

interface RunEstimatesProps {
	times: Record<string, TimeInput>;
	onTimeChange: (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => void;
}

const RunEstimates: React.FC<RunEstimatesProps> = ({ times, onTimeChange }) => {
	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		onTimeChange(distance, field, value);
	};

	return (
		<div className="p-4">
			<h2 className="text-2xl font-bold mb-4">Running Time Estimates</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{times && Object.entries(times).length > 0 ? (
					Object.entries(times).map(([distance, time]) => (
						<div key={distance} className="border p-4 rounded-lg">
							<h3 className="font-semibold mb-2">{distance}</h3>
							<div className="flex gap-2">
								<div>
									<label
										htmlFor={`${distance}-hours`}
										className="block text-sm"
									>
										Hours
									</label>
									<input
										id={`${distance}-hours`}
										type="number"
										min="0"
										value={time.hours}
										onChange={(e) =>
											handleTimeChange(distance, "hours", e.target.value)
										}
										className="w-20 border rounded p-1"
									/>
								</div>
								<div>
									<label
										htmlFor={`${distance}-minutes`}
										className="block text-sm"
									>
										Minutes
									</label>
									<input
										id={`${distance}-minutes`}
										type="number"
										min="0"
										max="59"
										value={time.minutes}
										onChange={(e) =>
											handleTimeChange(distance, "minutes", e.target.value)
										}
										className="w-20 border rounded p-1"
									/>
								</div>
								<div>
									<label
										htmlFor={`${distance}-seconds`}
										className="block text-sm"
									>
										Seconds
									</label>
									<input
										id={`${distance}-seconds`}
										type="number"
										min="0"
										max="59"
										value={time.seconds}
										onChange={(e) =>
											handleTimeChange(distance, "seconds", e.target.value)
										}
										className="w-20 border rounded p-1"
									/>
								</div>
							</div>
						</div>
					))
				) : (
					<p>No time estimates available</p>
				)}
			</div>
		</div>
	);
};

export default RunEstimates;
