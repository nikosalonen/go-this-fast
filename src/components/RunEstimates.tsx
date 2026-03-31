import type React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { DistanceTimeBox } from "./DistanceTimeBox";
import { milesToKm } from "../utils/conversion";

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
	customDistances?: Record<string, number>;
	onAddCustomDistance?: (label: string, km: number) => void;
}

const VISIBILITY_STORAGE_KEY = "runTimeBoxesVisibility";

const RunEstimates: React.FC<RunEstimatesProps> = ({
	times,
	onTimeChange,
	onPaceChange,
	onSpeedChange,
	customDistances,
	onAddCustomDistance,
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

	const allDistances = { ...distances, ...(customDistances ?? {}) };

	const [dialogOpen, setDialogOpen] = useState(false);
	const [newLabel, setNewLabel] = useState("");
	const [newValue, setNewValue] = useState("");
	const [newUnit, setNewUnit] = useState<"km" | "mi">("km");
	const [labelError, setLabelError] = useState("");

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
		const resetVisibility = Object.keys(allDistances).reduce(
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

		const distanceKm = allDistances[distance];

		if (distanceKm && totalSeconds > 0) {
			const pacePerKm = totalSeconds / distanceKm;
			onPaceChange?.(distance, pacePerKm);

			const speedKmH = (distanceKm / totalSeconds) * 3600;
			onSpeedChange?.(distance, speedKmH);

			updateAllDistances(distance, pacePerKm);
		}
	};

	const updateAllDistances = (sourceDistance: string, pacePerKm: number) => {
		if (!allDistances[sourceDistance]) return;

		Object.entries(allDistances).forEach(([distanceLabel, distanceKm]) => {
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

	const handleDialogSubmit = () => {
		const trimmedLabel = newLabel.trim();
		const numValue = Number.parseFloat(newValue);

		if (!trimmedLabel) {
			setLabelError("Label is required");
			return;
		}
		if (trimmedLabel in allDistances) {
			setLabelError("A distance with this label already exists");
			return;
		}
		if (!newValue || Number.isNaN(numValue) || numValue <= 0) {
			setLabelError("Enter a valid positive distance");
			return;
		}

		const km = newUnit === "mi" ? milesToKm(numValue) : numValue;
		onAddCustomDistance?.(trimmedLabel, km);
		setDialogOpen(false);
		setNewLabel("");
		setNewValue("");
		setNewUnit("km");
		setLabelError("");
	};

	const hasHiddenBoxes = Object.values(visibleBoxes).some(visible => visible === false);

	return (
		<Box sx={{ p: 2 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
				<Typography variant="h5" fontWeight="bold">
					Running Time Estimates
				</Typography>
				<Stack direction="row" spacing={1}>
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
					<Button
						variant="outlined"
						size="small"
						onClick={() => setDialogOpen(true)}
						aria-label="Add custom distance"
					>
						Add distance
					</Button>
				</Stack>
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
			<Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setLabelError(""); }} maxWidth="xs" fullWidth>
				<DialogTitle>Add Custom Distance</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						<TextField
							label="Label"
							value={newLabel}
							onChange={(e) => { setNewLabel(e.target.value); setLabelError(""); }}
							error={!!labelError}
							helperText={labelError || "e.g. 8km, 50km ultra"}
							fullWidth
							autoFocus
						/>
						<Stack direction="row" spacing={1}>
							<TextField
								label="Distance"
								type="number"
								value={newValue}
								onChange={(e) => setNewValue(e.target.value)}
								inputProps={{ min: 0, step: "any" }}
								fullWidth
							/>
							<FormControl sx={{ minWidth: 80 }}>
								<InputLabel>Unit</InputLabel>
								<Select
									value={newUnit}
									label="Unit"
									onChange={(e) => setNewUnit(e.target.value as "km" | "mi")}
								>
									<MenuItem value="km">km</MenuItem>
									<MenuItem value="mi">mi</MenuItem>
								</Select>
								<FormHelperText> </FormHelperText>
							</FormControl>
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { setDialogOpen(false); setLabelError(""); }}>Cancel</Button>
					<Button variant="contained" onClick={handleDialogSubmit}>Add</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default RunEstimates;
