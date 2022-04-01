import React from 'react'
import styles from './styles/DivStyle.module.css'
import { Box, Typography, Stack, ImageList } from '@mui/material'

export function Instructions() {
    return (
        <Box paddingTop={4}>
            <Stack spacing={2.5}>
                <Typography variant='h5' alignSelf={'center'} textAlign={'center'}>
                  Paste the website URL in the text field above and click the <b>SCRAP</b> button to download the attached media.
                </Typography>
                <ImageList cols={3} rowHeight={75} alignSelf={'center'}>
                    <div className={styles.imgHoverZoomColorize}>
                        <img src={'./cnn-logo.png'} />
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <img src={'./rfi-logo.png'} />
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <img src={'./youtube-logo.png'} />
                    </div>
                </ImageList>
            </Stack>
        </Box>
    )
}
