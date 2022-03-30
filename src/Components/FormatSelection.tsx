import React, { useState } from 'react'
import { Audiotrack, Videocam, Download } from '@mui/icons-material'
import { 
    Paper, 
    Box, 
    Typography, 
    Stack,
    LinearProgress,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    AlertColor
} from '@mui/material'

interface FormatSelectionProps {
    onNotification: (text: string, changeState: boolean, notiType: AlertColor) => void
    onLoading: () => void
    downloadLink: string[],
    m3u8: boolean
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

const HOST = 'https://mediascrapper.ninja'

export function FormatSelection(props: FormatSelectionProps) {
    const [loading, setLoading] = useState(false)

    const conversionStatCallback = async (timerId: NodeJS.Timer, requestId: string) => {
        try {
          const response = await fetch(`${HOST}/conversion/stat?url=${requestId}`, {
              method: 'GET'
            })

          const message = await response.text()

          if (!response.ok) {
            props.onNotification('Error converting file. Try again later.', true, 'error')
            setLoading(false)
            clearInterval(timerId)
          } else {
            if (message !== 'pending') {
                window.location.href = `${HOST}/download/${message}`
                props.onNotification('Starting download...', true, 'info')
                setLoading(false)
                clearInterval(timerId)
            }
          }
        } catch {
            props.onNotification('Error converting file. Try again later.', true, 'error')
            setLoading(false)
            clearInterval(timerId)
        }
    }

    const onLinkClicked = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
            props.onNotification("Link copied to clipboard!", false, 'success')
        }, (err) => {
            console.error(err)
            props.onNotification("Error copying the link...", false, 'error')
        })
    }

    const download = async (mp4: boolean, direct: boolean = false) => {
        if (direct || ((mp4 && props.downloadLink.includes('.mp4')) || (!mp4 && props.downloadLink.includes('.mp3')))) {
            props.onNotification('Starting download...', false, 'info')
            window.location.href = props.downloadLink[0]
            return
        }
        
        setLoading(true)
        props.onLoading()
        let path: string

        if (mp4 && props.m3u8) path = 'm3u8/mp4'
        else if (!mp4 && props.m3u8) path = 'm3u8/mp3'
        else if (mp4 && IsYoutube(props.downloadLink[0])) path = 'youtube/mp4'
        else if (!mp4 && IsYoutube(props.downloadLink[0])) path = 'youtube/mp3'
        else if (props.downloadLink[0].includes('twitter.com')) path = 'twitter'
        else return
        
        try {
            const request = await fetch(`${HOST}/${path}?url=${props.downloadLink}`)
            const requestId = await request.text()
            const conversionStat = setInterval(async () => {
                await conversionStatCallback(conversionStat, requestId)
            }, 5000)
        } catch {
            setLoading(false)
            props.onNotification('Error converting file. Try again later.', true, 'error')
        }
    }

    const dynamicDownloadTitle = (): JSX.Element => {
        if (props.m3u8 || IsYoutube(props.downloadLink[0]))
            return (
                <Typography variant='h4' style={{ alignSelf: 'center' }}>
                    Select format
                </Typography>
            )
        else if (props.downloadLink.length > 1)
            return (
                <Typography variant='h4' style={{ alignSelf: 'center' }}>
                    Scraped download links
                </Typography>
            )
        else
            return (
                <Typography variant='h4' style={{ alignSelf: 'center' }}>
                    Media ready for download
                </Typography>
            )
    }

    const isMultiFormat = (): boolean => {
        return props.m3u8 || IsYoutube(props.downloadLink[0])
    }

    const isMP4Only = (): boolean => {
        return props.downloadLink[0].includes('twitter.com')
    }

    const clampText = (text: string): string => {
        if (text.length <= 75) return text;

        return text.substring(0, 70).concat("...")
    }

    const dynamicDownloadButtons = () => {
        if (isMultiFormat())
            return (
                <Stack spacing={4} direction={'row'} alignSelf={'center'} paddingBottom={2}>
                    <Button disabled={loading} variant='contained' onClick={() => { download(false) }}>
                        MP3
                        <Audiotrack />
                    </Button>
                    <Button disabled={loading} variant='contained' onClick={() => { download(true) }}>
                        MP4
                        <Videocam />
                    </Button>
                </Stack>
            )
        else if (isMP4Only())
            return (
                <Stack spacing={4} direction={'row'} alignSelf={'center'} paddingBottom={2}>
                    <Button disabled={loading} variant='contained' onClick={() => { download(true) }}>
                        Download
                        <Download />
                    </Button>
                </Stack>
            )
        else if (props.downloadLink.length < 2)
            return (
                <Stack spacing={4} direction={'row'} alignSelf={'center'} paddingBottom={2}>
                    <Button disabled={loading} variant='contained' onClick={() => { download(true, true) }}>
                        Download
                        <Download />
                    </Button>
                </Stack>
            )
        else
            return (
                <List sx={{alignSelf: 'center', paddingBottom: 2}}>
                    {
                        props.downloadLink.map((link) => 
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => onLinkClicked(link)}>
                                <ListItemText primary={() => clampText(link)} />
                            </ListItemButton>
                        </ListItem>
                        )
                    }
                </List>
            )
    }

    return (
        <Box sx={{ flexGrow: 1 }} paddingTop={1.5}>
            <Paper>
              <Stack spacing={6} alignSelf={'center'} >
                { loading 
                    ?
                    <LoadingText />
                    :
                    dynamicDownloadTitle()
                }
                { dynamicDownloadButtons() }
                { loading ? <LinearProgress variant='indeterminate' /> : null }
              </Stack>
            </Paper>
        </Box>
    )
}
