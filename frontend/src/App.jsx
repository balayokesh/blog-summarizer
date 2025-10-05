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
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import './App.css'

const lengthOptions = [
	'small',
	'medium',
	'large',
];

function App() {
	const [summarizedText, setSummarizedText] = useState("Use AI to summarize your blog post");
	const [lengthOption, setLengthOption] = useState('small');

	const handleChange = (event) => {
		const {
			target: { value },
		} = event;
		setLengthOption(
			typeof value === 'string' ? value : 'small',
		);
	};

	const handleSummarize = () => {
		// This would be replaced with actual API call
		setSummarizedText("This is where your summarized blog post will appear. The summary length will be " + lengthOption + ".");
	};

	return (
		<>
			<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
				<Typography variant="h1" component="h1" align="center" sx={{ my: 4 }}>
					Blog Summarizer
				</Typography>

				<Box className="main-container" sx={{ flex: 1 }}>
					<Box className="form-section">
						<Box sx={{ width: 500, maxWidth: '100%' }}>
							<FormControl fullWidth sx={{ mb: 3 }}>
								<TextField 
									fullWidth 
									label="Paste the blog content here" 
									id="blog-content" 
									variant="outlined"
									multiline
									rows={10}
									sx={{ mb: 2 }}
								/>
							</FormControl>

							<FormControl fullWidth sx={{ mb: 3 }}>
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
								endIcon={<AutoAwesomeIcon />}
								onClick={handleSummarize}
								fullWidth
							>
								Summarize
							</Button>
						</Box>
					</Box>

					<Box className="summary-section">
						<Paper elevation={3} sx={{ p: 3, minHeight: 300, width: 500, maxWidth: '100%' }}>
							<Typography variant="h6" component="h2" gutterBottom>
								Summary Output
							</Typography>
							<Typography variant="body1" component="p">
								{summarizedText}
							</Typography>
						</Paper>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default App
