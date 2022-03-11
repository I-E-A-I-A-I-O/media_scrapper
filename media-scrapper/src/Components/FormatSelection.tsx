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
}

export function FormatSelection(props: FormatSelectionProps) {
    const [loading, setLoading] = useState(false)

    const download = async (mp4: boolean) => {
        setLoading(true)
        props.onLoading()

        setTimeout(() => {
            setLoading(false)
            props.onCompleted()
        }, 10000)
    }

    return (
        <Box sx={{ flexGrow: 1 }} paddingTop={1.5}>
            <Paper>
              <Stack spacing={2} alignSelf={'center'} >
                <Typography variant='h4' style={{ alignSelf: 'center' }}>
                  {props.formats === 'mp3' ? 'Audio ready for download' : 'Select format'}
                </Typography>
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
              </Stack>
            </Paper>
        </Box>
    )
}
