import React, { useState } from 'react'
import './App.css';
import { Construction, Close } from '@mui/icons-material'
import { LoadingCard } from './Components/LoadingCard'
import { FormatSelection } from './Components/FormatSelection'
import { Instructions } from './Components/Instructions'
import { 
  Paper,
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Stack,
  Collapse,
  Alert,
  IconButton,
  ThemeProvider,
  createTheme
} from '@mui/material'

function App() {
  const [converting, setConverting] = useState(false)
  const [url, setURL] = useState('')
  const [step, setStep] = useState(0)
  const [format, setFormat] = useState<'mp3' | 'mp3&mp4'>('mp3')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [loadingText, setLoadingText] = useState('')
  const [downloadLink, setDownloadLink] = useState('')

  const theme = createTheme({
    palette: { mode: 'dark' }
  })

  const showError = (err: string) => {
    setError(err)
    setOpen(true)
  }

  const postURL = async () => {
    try {
      setConverting(true)

      if (!url || url.length === 0) {
        setStep(0)
        showError('No URL provided')
        return setConverting(false)
      }

      setLoadingText('Scrapping media from URL...')
      setStep(1)
      setOpen(false)
      const response = await fetch('http://localhost:3000/scrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        const body: { url: string, m3u8: boolean, format: 'mp3' | 'mp3&mp4' } = await response.json()
        setFormat(body.format)
        setDownloadLink(body.url)
        setStep(2)
      }
      else {
        const body = await response.text();
        showError(body)
        setStep(0)
      }

      setConverting(false)
    } catch (err) {
      console.error(err)
      setConverting(false)
    }
  }

  const restart = () => {
    setConverting(false)
  }

  const stepHandler = () => {
    if (step < 1) return (<Instructions />)

    if (step === 1) return (<LoadingCard text='Scrapping video... CNN links might take a little longer.' />)
  
    if (step === 2) return (
      <FormatSelection 
        downloadLink={downloadLink}
        onLoading={() => { setConverting(true) }} 
        onCompleted={() => { restart() }} 
        formats={format} />
    )
  }

  return (
    <ThemeProvider theme={ theme }>
      <Paper sx={{height: '100vh', width: 1}}>
        <Box sx={{ flexGrow: 1 }} width={1}>
          <AppBar position='static'>
            <Toolbar>
              <img width={70} src="/ed-smiley.png" alt="image" style={{ alignSelf: 'center' }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Media Scrapper
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Collapse in={open}>
            <Alert
              severity='error'
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <Close />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          </Collapse>
        </Box>
        <Box sx={{ flexGrow: 1 }} paddingTop={1.5}>
          <Card>
            <CardContent>
              <Stack direction={'row'} spacing={2}>
                <TextField value={url} onChange={(val) => { setURL(val.target.value) }} fullWidth id="filled-basic" label="Website URL" variant="filled" />
                <Button disabled={converting} onClick={postURL} variant='contained'>
                  scrap
                  <Construction />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        {stepHandler()}
      </Paper>
    </ThemeProvider>
  );
}

export default App;
