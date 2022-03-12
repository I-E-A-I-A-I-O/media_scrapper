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
    onCompleted: () => void
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

export function FormatSelection(props: FormatSelectionProps) {
    const [loading, setLoading] = useState(false)

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
        else {
            setLoading(false)
            return props.onCompleted()
        }

        const response = await fetch(`http://localhost:3000/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: props.downloadLink })
        })

        if (response.ok) {
            const body: { fileName: string } = await response.json()
            window.location.href = `http://localhost:3000/download/${body.fileName}.${path.split('/')[1]}`
        }

        setLoading(false)
        props.onCompleted()
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
