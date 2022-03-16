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
  createTheme,
  AlertColor
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
  const [severity, setSeverity] = useState<AlertColor>('success')

  const theme = createTheme({
    palette: { mode: 'dark' }
  })

  const showError = (err: string, type: AlertColor) => {
    setError(err)
    setSeverity(type)
    setOpen(true)
  }

  const conversionStatCallback = async (timerId: NodeJS.Timer, requestId: string) => {
    try {
      const response = await fetch(
        `https://media-scrapper.herokuapp.com/scrap/stat?url=${requestId}`, {
          method: 'GET'
        })

      const message = await response.text()

      if (!response.ok) {
        showError('Error converting file. Try again later.', 'error')
        setStep(2)
        setConverting(false)
        clearInterval(timerId)
      } else {
        if (message !== 'pending') {
          setFormat('mp3&mp4')
          setDownloadLink(message)
          setStep(2)
          setConverting(false)
          clearInterval(timerId)
        }
      }
    } catch {
      showError('Error converting file. Try again later.', 'error')
      setStep(2)
      setConverting(false)
      clearInterval(timerId)
    }
  }

  const postURL = async () => {
    try {
      setConverting(true)

      if (!url || url.length === 0) {
        setStep(0)
        showError('No URL provided', 'error')
        return setConverting(false)
      }

      setLoadingText('Scrapping media from URL... m3u8 formats might take longer.')
      setStep(1)
      setOpen(false)
      const response = await fetch('https://media-scrapper.herokuapp.com/scrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (response.status === 200) {
        const body: { url: string, m3u8: boolean, format: 'mp3' | 'mp3&mp4' } = await response.json()
        setFormat(body.format)
        setDownloadLink(body.url)
        setStep(2)
        setConverting(false)
      }
      else if (response.status === 202) {
        const requestId = await response.text()
        const conversionStat = setInterval(async () => {
          await conversionStatCallback(conversionStat, requestId)
        }, 5000)
      }
      else {
        const body = await response.text()
        showError(body, 'error')
        setStep(0)
        setConverting(false)
      }

    } catch (err) {
      console.error(err)
      setConverting(false)
    }
  }

  const stepHandler = () => {
    if (step < 1) return (<Instructions />)

    if (step === 1) return (<LoadingCard text={loadingText} />)
  
    if (step === 2) return (
      <FormatSelection 
        downloadLink={downloadLink}
        onLoading={() => { setConverting(true) }} 
        onNotification={(str) => { setConverting(false) }} 
        formats={format} />
    )
  }

  return (
    <ThemeProvider theme={ theme }>
      <Paper sx={{height: '100vh', width: 1}}>
        <Box sx={{ flexGrow: 1 }} width={1}>
          <AppBar position='static'>
            <Toolbar>
              <img width={70} src="/ed-smiley.png" alt="logo" style={{ alignSelf: 'center' }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Media Scrapper
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Collapse in={open}>
            <Alert
              severity={severity}
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
