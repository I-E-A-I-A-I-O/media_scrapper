import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Construction } from '@mui/icons-material'
import { Container, AppBar, Toolbar, Box, Typography, Card, CardContent, TextField, Button, Stack } from '@mui/material'

function App() {
  const [converting, setConverting] = useState(false)
  const [url, setURL] = useState('')

  const postURL = async () => {
    try {
      setConverting(true)

      if (!url || url.length === 0) {
        console.log('EMPTY')
        return setConverting(false)
      }

      const response = await fetch('http://localhost:3000/cnn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        const body = await response.text()
        console.log(body)
      }

      setConverting(false)
    } catch(err) {
      console.error(err)
      setConverting(false)
    }
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ flexGrow: 1 }} width={1}>
        <AppBar position='static'>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Media Scrapper
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box paddingTop={1.5}>
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
    </Container>
  );
}

export default App;
