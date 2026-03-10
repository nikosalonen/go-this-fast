import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
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
						<TextField
							label="Hours"
							type="number"
							sx={{ width: 88 }}
							value={time.hours.toString()}
							onChange={(e) => onTimeChange("hours", e.target.value)}
							inputProps={{ min: 0, max: 24, style: { textAlign: "center" } }}
						/>
					)}
					<TextField
						label="Min"
						type="number"
						sx={{ width: 88 }}
						value={time.minutes.toString()}
						onChange={(e) => onTimeChange("minutes", e.target.value)}
						inputProps={{ min: 0, max: 59, style: { textAlign: "center" } }}
					/>
					<TextField
						label="Sec"
						type="number"
						sx={{ width: 88 }}
						value={time.seconds.toString()}
						onChange={(e) => onTimeChange("seconds", e.target.value)}
						inputProps={{ min: 0, max: 59, style: { textAlign: "center" } }}
					/>
				</Stack>
			</CardContent>
		</Card>
	);
};
