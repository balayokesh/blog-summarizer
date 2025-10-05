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
	'short',
	'medium',
	'large',
];

function App() {
	const [summarizedText, setSummarizedText] = useState('Use AI to summarize your blog post');
	const [bullets, setBullets] = useState([]);
	const [lengthOption, setLengthOption] = useState('short');
	const [blogContent, setBlogContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (event) => {
		const {
			target: { value },
		} = event;
		setLengthOption(
			typeof value === 'string' ? value : 'short',
		);
	};

	const handleSummarize = async () => {
		setError('');
		setLoading(true);
		setSummarizedText('');
		setBullets([]);
		try {
			const response = await fetch('https://blog-summarizer-fetn.onrender.com/summarize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: blogContent, length: lengthOption })
			});
			const data = await response.json();
			if (data.success && data.data) {
				setSummarizedText(data.data.tldr);
				setBullets(data.data.bullets || []);
			} else {
				setError('Failed to summarize. Please try again.');
			}
		} catch (err) {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
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
									value={blogContent}
									onChange={e => setBlogContent(e.target.value)}
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
								disabled={loading || !blogContent.trim()}
							>
								{loading ? 'Summarizing...' : 'Summarize'}
							</Button>
							{error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
						</Box>
					</Box>

					<Box className="summary-section">
						<Paper elevation={3} style={{ minHeight: 450 }} sx={{ p: 3, minHeight: 300, width: 500, maxWidth: '100%' }}>
							<Typography variant="h6" component="h2" gutterBottom>
								Summary Output
							</Typography>
							{loading ? (
								<Typography variant="body1">Generating summary...</Typography>
							) : (
								<>
									{summarizedText && <Typography variant="body1" sx={{ mb: 2 }}>{summarizedText}</Typography>}
									{bullets.length > 0 && (
										<ul style={{ textAlign: 'left', margin: 0, paddingLeft: 20 }}>
											{bullets.map((b, i) => (<li key={i}>{b}</li>))}
										</ul>
									)}
								</>
							)}
						</Paper>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default App
