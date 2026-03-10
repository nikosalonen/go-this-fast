import type React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { DistanceTimeBox } from "./DistanceTimeBox";

export interface TimeInput {
	hours: number | "";
	minutes: number | "";
	seconds: number | "";
}

interface RunEstimatesProps {
	times: Record<string, TimeInput>;
	onTimeChange: (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => void;
	onPaceChange?: (distance: string, pacePerKm: number) => void;
	onSpeedChange?: (distance: string, speedKmH: number) => void;
}

const VISIBILITY_STORAGE_KEY = "runTimeBoxesVisibility";

const RunEstimates: React.FC<RunEstimatesProps> = ({
	times,
	onTimeChange,
	onPaceChange,
	onSpeedChange,
}) => {
	const distances: Record<string, number> = {
		"100m": 0.1,
		"400m": 0.4,
		"1km": 1,
		"1mile": 1.60934,
		"5km": 5,
		"10km": 10,
		"Half Marathon": 21.0975,
		"Marathon": 42.195,
	};

	const [visibleBoxes, setVisibleBoxes] = useState<Record<string, boolean>>({});

	useEffect(() => {
		try {
			const savedVisibility = localStorage.getItem(VISIBILITY_STORAGE_KEY);
			if (savedVisibility) {
				setVisibleBoxes(JSON.parse(savedVisibility));
			} else {
				const initialVisibility = Object.keys(distances).reduce(
					(acc, distance) => ({ ...acc, [distance]: true }),
					{}
				);
				setVisibleBoxes(initialVisibility);
				localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(initialVisibility));
			}
		} catch (error) {
			console.error("Error loading time box visibility from localStorage:", error);
			const initialVisibility = Object.keys(distances).reduce(
				(acc, distance) => ({ ...acc, [distance]: true }),
				{}
			);
			setVisibleBoxes(initialVisibility);
		}
	}, []);

	useEffect(() => {
		if (Object.keys(visibleBoxes).length > 0) {
			localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(visibleBoxes));
		}
	}, [visibleBoxes]);

	const handleCloseBox = (distance: string) => {
		setVisibleBoxes(prev => ({
			...prev,
			[distance]: false
		}));
	};

	const handleResetVisibility = () => {
		const resetVisibility = Object.keys(distances).reduce(
			(acc, distance) => ({ ...acc, [distance]: true }),
			{}
		);
		setVisibleBoxes(resetVisibility);
	};

	const handleTimeChange = (
		distance: string,
		field: keyof TimeInput,
		value: string,
	) => {
		const cleanedValue = value.replace(/^0+/, "") || "0";
		onTimeChange(distance, field, cleanedValue);

		const updatedTime = { ...times[distance], [field]: cleanedValue === "0" ? 0 : Number(cleanedValue) };
		const totalSeconds =
			(updatedTime.hours === "" ? 0 : Number(updatedTime.hours)) * 3600 +
			(updatedTime.minutes === "" ? 0 : Number(updatedTime.minutes)) * 60 +
			(updatedTime.seconds === "" ? 0 : Number(updatedTime.seconds));

		const distanceKm = distances[distance];

		if (distanceKm && totalSeconds > 0) {
			const pacePerKm = totalSeconds / distanceKm;
			onPaceChange?.(distance, pacePerKm);

			const speedKmH = (distanceKm / totalSeconds) * 3600;
			onSpeedChange?.(distance, speedKmH);

			updateAllDistances(distance, pacePerKm);
		}
	};

	const updateAllDistances = (sourceDistance: string, pacePerKm: number) => {
		if (!distances[sourceDistance]) return;

		Object.entries(distances).forEach(([distanceLabel, distanceKm]) => {
			if (distanceLabel === sourceDistance) return;

			const totalSeconds = pacePerKm * distanceKm;

			let hours = Math.floor(totalSeconds / 3600);
			let minutes = Math.floor((totalSeconds % 3600) / 60);
			let seconds = Math.floor(totalSeconds % 60);

			if (shouldHideHours(distanceLabel) && hours > 0) {
				minutes += hours * 60;
				hours = 0;
			}

			onTimeChange(distanceLabel, "hours", hours.toString());
			onTimeChange(distanceLabel, "minutes", minutes.toString());
			onTimeChange(distanceLabel, "seconds", seconds.toString());
		});
	};

	const shouldHideHours = (distance: string): boolean => {
		const shortDistances = ["100m", "400m", "1km", "1mile", "5km"];
		return shortDistances.includes(distance);
	};

	const hasHiddenBoxes = Object.values(visibleBoxes).some(visible => visible === false);

	return (
		<Box sx={{ p: 2 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h5" fontWeight="bold">
					Running Time Estimates
				</Typography>
				{hasHiddenBoxes && (
					<Button
						variant="contained"
						size="small"
						onClick={handleResetVisibility}
						aria-label="Reset hidden time boxes"
					>
						Reset Hidden Boxes
					</Button>
				)}
			</Stack>
			<Grid container spacing={2}>
				{times && Object.entries(times).length > 0 ? (
					Object.entries(times)
						.filter(([distance]) => visibleBoxes[distance] !== false)
						.map(([distance, time]) => (
							<Grid key={distance} size={{ xs: 12, md: 6, lg: 4 }}>
								<DistanceTimeBox
									distance={distance}
									time={time}
									onTimeChange={(field, value) =>
										handleTimeChange(distance, field, value)
									}
									disableHours={shouldHideHours(distance)}
									onClose={() => handleCloseBox(distance)}
								/>
							</Grid>
						))
				) : (
					<Grid size={12}>
						<Typography>No time estimates available</Typography>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default RunEstimates;
