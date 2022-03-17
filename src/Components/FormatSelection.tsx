import React, { useState } from 'react'
import { Audiotrack, Videocam } from '@mui/icons-material'
import { 
    Paper, 
    Box, 
    Typography, 
    Stack,
    LinearProgress,
    Button
} from '@mui/material'

interface FormatSelectionProps {
    onNotification: (text: string) => void
    onLoading: () => void
    formats: 'mp3' | 'mp3&mp4'
    downloadLink: string
}

function LoadingText() {
    return (
        <Stack>
            <Typography variant='h4' style={{ alignSelf: 'center' }}>
                Converting file...
            </Typography>
            <Typography variant='h6' color={'gray'} style={{ alignSelf: 'center' }}>
                Download will start shortly
            </Typography>
        </Stack>
    )
}

function IsYoutube(url: string): boolean {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return true

    return false
}

const HOST = 'https://media-scraper-ninja.herokuapp.com'

export function FormatSelection(props: FormatSelectionProps) {
    const [loading, setLoading] = useState(false)

    const conversionStatCallback = async (timerId: NodeJS.Timer, requestId: string) => {
        try {
          const response = await fetch(
            `${HOST}/conversion/stat?url=${requestId}`, {
              method: 'GET'
            })

          const message = await response.text()

          if (!response.ok) {
            props.onNotification('Error converting file. Try again later.')
            setLoading(false)
            clearInterval(timerId)
          } else {
            if (message !== 'pending') {
                window.location.href = `${HOST}/download/${message}`
                props.onNotification('Starting download...')
                setLoading(false)
                clearInterval(timerId)
            }
          }
        } catch {
            props.onNotification('Error converting file. Try again later.')
            setLoading(false)
            clearInterval(timerId)
        }
    }

    const download = async (mp4: boolean) => {
        if ((mp4 && props.downloadLink.includes('.mp4')) || (!mp4 && props.downloadLink.includes('.mp3'))) {
            window.location.href = props.downloadLink
            return
        }
        
        setLoading(true)
        props.onLoading()
        let path: string

        if (!mp4 && props.downloadLink.includes('.mp4')) path = 'mp4/mp3'
        else if (mp4 && props.downloadLink.includes('.m3u8')) path = 'm3u8/mp4'
        else if (!mp4 && props.downloadLink.includes('.m3u8')) path = 'm3u8/mp3'
        else if (mp4 && IsYoutube(props.downloadLink)) path = 'youtube/mp4'
        else if (!mp4 && IsYoutube(props.downloadLink)) path = 'youtube/mp3'
        else return
        
        if (path.includes('m3u8')) {
            try {
                const request = await fetch(`https://media-scrapper.herokuapp.com/${path}?url=${props.downloadLink}`)
                const requestId = await request.text()
                const conversionStat = setInterval(async () => {
                    await conversionStatCallback(conversionStat, requestId)
                }, 5000)
            } catch {
                setLoading(false)
                props.onNotification('Error converting file. Try again later.')
            }
        }
        else {
            window.location.href = `https://media-scrapper.herokuapp.com/${path}?url=${props.downloadLink}`
            props.onNotification('Converting file... download will start shortly')
    
            setTimeout(() => {
                setLoading(false)
                props.onNotification('')
            }, 30000)
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }} paddingTop={1.5}>
            <Paper>
              <Stack spacing={6} alignSelf={'center'} >
                { loading 
                    ?
                    <LoadingText />
                    :
                    <Typography variant='h4' style={{ alignSelf: 'center' }}>
                      { props.formats === 'mp3' ? 'Audio ready for download' : 'Select format' }
                    </Typography>
                }
                <Stack spacing={4} direction={'row'} alignSelf={'center'} paddingBottom={2}>
                    <Button disabled={loading} variant='contained' onClick={() => { download(false) }}>
                        MP3
                        <Audiotrack />
                    </Button>
                    {
                    props.formats === 'mp3' ? null : 
                    (
                        <Button disabled={loading} variant='contained' onClick={() => { download(true) }}>
                            MP4
                            <Videocam />
                        </Button>
                    )
                    }
                </Stack>
                { loading ? <LinearProgress variant='indeterminate' /> : null }
              </Stack>
            </Paper>
        </Box>
    )
}
