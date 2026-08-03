import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ButtonBase from "@mui/material/ButtonBase";
import CloseIcon from "@mui/icons-material/Close";
import type { TimeInput } from "./RunEstimates";

interface DistanceTimeBoxProps {
	distance: string;
	time: TimeInput;
	onTimeChange: (field: keyof TimeInput, value: string) => void;
	disableHours?: boolean;
	onClose?: () => void;
}

const toNumber = (value: number | "") => (value === "" ? 0 : Number(value));

const formatTime = ({ hours, minutes, seconds }: TimeInput) => {
	const pad = (n: number) => n.toString().padStart(2, "0");
	const h = toNumber(hours);
	return h > 0
		? `${h}:${pad(toNumber(minutes))}:${pad(toNumber(seconds))}`
		: `${toNumber(minutes)}:${pad(toNumber(seconds))}`;
};

export const DistanceTimeBox: React.FC<DistanceTimeBoxProps> = ({
	distance,
	time,
	onTimeChange,
	disableHours = false,
	onClose,
}) => {
	const [editing, setEditing] = useState(false);

	// Collapse back to the readout only once focus leaves the whole field group
	const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
			setEditing(false);
		}
	};

	return (
		<Card
			variant="outlined"
			sx={{
				position: "relative",
				// Keep the close button out of the way until the card is hovered or focused;
				// on touch there is no hover, so it stays visible
				"@media (hover: hover)": {
					"& .distance-box-close": { opacity: 0 },
					"&:hover .distance-box-close, &:focus-within .distance-box-close": {
						opacity: 1,
					},
				},
			}}
		>
			<CardContent>
				{onClose && (
					<IconButton
						className="distance-box-close"
						onClick={onClose}
						size="small"
						aria-label={`Close ${distance}`}
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							transition: "opacity 150ms",
						}}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				)}
				<Typography
					component="h3"
					variant="subtitle1"
					sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}
				>
					{distance}
				</Typography>
				{editing ? (
					<Stack direction="row" spacing={1.5} onBlur={handleBlur}>
						{!disableHours && (
							<TextField
								label="Hours"
								type="number"
								size="small"
								autoFocus
								sx={{ width: 80 }}
								value={time.hours.toString()}
								onChange={(e) => onTimeChange("hours", e.target.value)}
								slotProps={{
									htmlInput: { min: 0, max: 24, style: { textAlign: "center" } },
								}}
							/>
						)}
						<TextField
							label="Min"
							type="number"
							size="small"
							autoFocus={disableHours}
							sx={{ width: 80 }}
							value={time.minutes.toString()}
							onChange={(e) => onTimeChange("minutes", e.target.value)}
							slotProps={{
								htmlInput: { min: 0, max: 59, style: { textAlign: "center" } },
							}}
						/>
						<TextField
							label="Sec"
							type="number"
							size="small"
							sx={{ width: 80 }}
							value={time.seconds.toString()}
							onChange={(e) => onTimeChange("seconds", e.target.value)}
							slotProps={{
								htmlInput: { min: 0, max: 59, style: { textAlign: "center" } },
							}}
						/>
					</Stack>
				) : (
					<ButtonBase
						onClick={() => setEditing(true)}
						aria-label={`Edit ${distance} time`}
						sx={{ borderRadius: 1, px: 0.5, mx: -0.5 }}
					>
						<Typography
							variant="h4"
							sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
						>
							{formatTime(time)}
						</Typography>
					</ButtonBase>
				)}
			</CardContent>
		</Card>
	);
};
