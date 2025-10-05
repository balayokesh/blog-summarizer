import { useState } from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

import './App.css'

const lengthOptions = [
	'small',
	'medium',
	'large',
];

function App() {
	const [summarizedText, setSummarizedText] = useState("Use AI to summarize your blog post");
	const [lengthOption, setLengthOption] = useState([]);

	const handleChange = (event) => {
		const {
			target: { value },
		} = event;
		setLengthOption(
			typeof value === 'string' ? value : 'small',
		);
	};

	return (
		<>
			<h1>Blog Summarizer</h1>

			<div className="main-container">
				<Box sx={{ width: 500, maxWidth: '100%' }} fullWidth>
					<FormControl fullWidth style={{ marginBottom: "15px" }}>
						<TextField fullWidth label="Paste the blog content here" id="blog-content" />
					</FormControl>

					<FormControl fullWidth style={{ marginBottom: "15px" }}>
						<InputLabel id="preferred-summary-length-label">Preferred summary length</InputLabel>
						<Select
							labelId="preferred-summary-length-label"
							id="preferred-summary-length"
							value={lengthOption}
							onChange={handleChange}
							input={<OutlinedInput label="Preferred summary length" />}
						>
							{lengthOptions.map((option) => (
								<MenuItem
									key={option}
									value={option}
								>
									{option}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Button
						variant="contained"
						size='large'
						endIcon={
							<AutoAwesomeIcon />
						}
					>
						Summarize
					</Button> 	

				</Box>

				<div>
					<p>{summarizedText}</p>
				</div>
			</div>
		</>
	)
}

export default App
