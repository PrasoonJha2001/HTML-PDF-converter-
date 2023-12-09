const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json()); // Parse JSON data in request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data in request body

app.use(express.static(__dirname)); // Serve static files (including index.html)

app.post('/', upload.single('file'), async (req, res) => {
    // Fetch email and file from request body
    const { email } = req.body;
    const file = req.file;

    // Check if email and file are provided
    if (!email || !file) {
        res.status(422).json({ error: "Please fill all the fields and provide a file" });
        return;
    }

    const htmlContent = file.buffer.toString();
    console.log(htmlContent);
    // Convert the file buffer (assumed to be HTML content) to a string
    // Create a PDF from the HTML content
    pdf.create(htmlContent).toBuffer(async (err, pdfBuffer) => {
        if (err) {
            console.error('Error creating PDF:', err);
            res.status(500).json({ error: 'Error creating PDF' });
            return;
        }
        
        // To set up email transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'your gmail', // Replace with your Gmail ID
                pass: 'you pass key'    // Replace with your Gmail app password
            }
        });
         // To configure email options, including attachment of the generated PDF
        const mailOptions = {
            from: 'your gamil',     // Replace with your Gmail ID
            to: email,
            subject: 'YOUR HTML FILE IS CONVERTED ACCURATELY',
            text: 'Please view the below attachment for your converted PDF file! Thank You!🙂✌',
            attachments: [
                {
                    filename: 'Converted.pdf',
                    content: pdfBuffer
                }
            ]
        };
        
        // Send email with the converted PDF attachment
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
            return;
        }
        // Responding with success message
        res.status(200).json({ message: "File uploaded successfully and email sent" });
    });
});

// Set port number for server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
