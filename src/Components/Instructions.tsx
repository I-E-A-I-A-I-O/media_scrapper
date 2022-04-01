import React from 'react'
import styles from './styles/DivStyle.module.css'
import { Box, Typography, Stack, ImageList } from '@mui/material'
import Carousel from 'react-material-ui-carousel'

export function Instructions() {
    return (
        <Box paddingTop={4}>
            <Stack spacing={2.5}>
                <Typography variant='h5' alignSelf={'center'} textAlign={'center'}>
                  Paste the website URL in the text field above and click the <b>SCRAP</b> button to download the attached media.
                </Typography>
                <Carousel 
                    autoPlay 
                    stopAutoPlayOnHover
                    //animation='slide'
                    swipe
                    sx={{ textAlign: 'center', paddingTop: 8 }}>
                    <div className={styles.imgHoverZoomColorize}>
                        <a href='https://edition.cnn.com/'>
                            <img src={'./cnn-logo.png'} alt={'cnn'} />
                        </a>
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <a href='https://www.rfi.fr/en/'>
                            <img src={'./rfi-logo.png'} alt={'radio france internationale'} />
                        </a>
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <a href='https://youtube.com'>
                            <img src={'./youtube-logo.png'} alt={'youtube'} />
                        </a>
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <a href='https://twitter.com'>
                            <img src={'./twitter-logo.png'} alt={'twitter'} />
                        </a>
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <a href='https://instagram.com'>
                            <img src={'./instagram-logo.png'} alt={'instagram'} />
                        </a>
                    </div>
                    <div className={styles.imgHoverZoomColorize}>
                        <img src={'./m3u8-logo.png'} alt={'m3u8'} />
                    </div>
                </Carousel>
            </Stack>
        </Box>
    )
}
