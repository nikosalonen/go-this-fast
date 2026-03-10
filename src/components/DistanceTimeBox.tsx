import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloseIcon from "@mui/icons-material/Close";
import type { TimeInput } from "./RunEstimates";

interface DistanceTimeBoxProps {
	distance: string;
	time: TimeInput;
	onTimeChange: (field: keyof TimeInput, value: string) => void;
	disableHours?: boolean;
	onClose?: () => void;
}

export const DistanceTimeBox: React.FC<DistanceTimeBoxProps> = ({
	distance,
	time,
	onTimeChange,
	disableHours = false,
	onClose,
}) => {
	const hoursOptions = Array.from({ length: 25 }, (_, i) => i.toString());
	const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString());
	const secondsOptions = Array.from({ length: 60 }, (_, i) => i.toString());

	return (
		<Card variant="outlined" sx={{ position: "relative" }}>
			<CardContent>
				{onClose && (
					<IconButton
						onClick={onClose}
						size="small"
						aria-label={`Close ${distance}`}
						sx={{ position: "absolute", top: 8, right: 8 }}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				)}
				<Typography variant="subtitle1" fontWeight={600} mb={2}>
					{distance}
				</Typography>
				<Stack direction="row" spacing={1.5}>
					{!disableHours && (
						<FormControl size="small" sx={{ minWidth: 80 }}>
							<InputLabel id={`${distance}-hours-label`}>Hours</InputLabel>
							<Select
								labelId={`${distance}-hours-label`}
								id={`${distance}-hours`}
								value={time.hours.toString()}
								onChange={(e) => onTimeChange("hours", e.target.value)}
								label="Hours"
							>
								{hoursOptions.map((hour) => (
									<MenuItem key={hour} value={hour}>
										{hour}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)}
					<FormControl size="small" sx={{ minWidth: 80 }}>
						<InputLabel id={`${distance}-minutes-label`}>Min</InputLabel>
						<Select
							labelId={`${distance}-minutes-label`}
							id={`${distance}-minutes`}
							value={time.minutes.toString()}
							onChange={(e) => onTimeChange("minutes", e.target.value)}
							label="Min"
						>
							{minutesOptions.map((minute) => (
								<MenuItem key={minute} value={minute}>
									{minute}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl size="small" sx={{ minWidth: 80 }}>
						<InputLabel id={`${distance}-seconds-label`}>Sec</InputLabel>
						<Select
							labelId={`${distance}-seconds-label`}
							id={`${distance}-seconds`}
							value={time.seconds.toString()}
							onChange={(e) => onTimeChange("seconds", e.target.value)}
							label="Sec"
						>
							{secondsOptions.map((second) => (
								<MenuItem key={second} value={second}>
									{second}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</CardContent>
		</Card>
	);
};
