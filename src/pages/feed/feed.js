import { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import './feed.css'
import AddPostModaal from '../addPost/addPost';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDropzone } from 'react-dropzone';
import Form from "react-bootstrap/Form";
import { getDownloadURL } from "firebase/storage";
import { getMetadata, updateMetadata } from "firebase/storage";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { ref, uploadBytes } from "firebase/storage";

import { ToastContainer, toast } from "react-toastify";
import { collection, addDoc, Timestamp, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'
import "react-toastify/dist/ReactToastify.css";

import { db, storage } from "../../firebase.config";

function Feed() {

    const [openModal, setopenModal] = useState(false)
    const [data, setData] = useState([])


    console.log(data, "-----------========")

    useEffect(() => {
        async function GetData() {
            const docSnap = await getDocs(collection(db, "posts"));
            const Product = [...data];
            docSnap.forEach((doc) => {
                if (Product.filter((a) => a?.id == doc?.id).length == 0) {
                    Product.push({ id: doc?.id, ...doc.data() });
                }
            });
            setData(Product);
        }

        GetData()


    }, [openModal === false])



    return (
        <>
            <Nav
                style={{
                    position: "fixed",
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center", // Add this line for vertical centering
                    width: "100%", // Add this line to ensure full width
                    backgroundColor: "#dbe1e3", // Glass-like background color
                    backdropFilter: "blur(10px)",
                    bottom: 0,
                    color:"green"
                }}
                activeKey="/home"
                onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
            >
                <Nav.Item style={{ backgroundColor: "#6D951A" }}>
                    <Nav.Link onClick={() => { setopenModal(true) }}>Add Advertisment</Nav.Link>
                </Nav.Item>
            </Nav>
            <br />
            <Container>
                <Row>
                    {data.map((item) => (
                        <Col key={item.id} xs={6} md={4}>
                            <Card style={{ width: '18rem' }}>
                                <Card.Img style={{ height: "300px", objectFit: "cover" }} variant="top" src={`https://firebasestorage.googleapis.com/v0/b/pet-website-2f3f5.appspot.com/o/images%2F${item.image}?alt=media`} alt="" />
                                <Card.Body>
                                    <Card.Title>{item.category}</Card.Title>
                                    <Card.Text>{item.description}</Card.Text>
                                </Card.Body>
                            </Card>
                            <br />
                            <br />
                        </Col>
                    ))}

                </Row>

            </Container>
            {openModal === true ?
                <MyVerticallyCenteredModal
                    show={openModal}
                    onHide={() => setopenModal(false)}
                />
                : ""
            }
        </>

    );
}

const initialState = {
    description: "",
    category: "Adopted"
};

function MyVerticallyCenteredModal(props) {

    const [data, setData] = useState(initialState);

    const [files, setFiles] = useState([]);



    const thumbsContainer = {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16
    };

    const thumb = {
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: 8,
        marginRight: 8,
        width: 100,
        height: 100,
        padding: 4,
        boxSizing: 'border-box'
    };

    const thumbInner = {
        display: 'flex',
        minWidth: 0,
        overflow: 'hidden'
    };

    const img = {
        display: 'block',
        width: 'auto',
        height: '100%'
    };

    console.log(data, files, "data")

    const onHandleChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });

    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const storageRef = ref(
                storage,
                `images/${Math.random() * 100}${files[0].name.replace(/\s+/g, "_")}`
            );

            const convertedImageBlob = await convertToPNG(files[0]);

            uploadBytes(storageRef, convertedImageBlob).then(async (snapshot) => {
                console.log(snapshot.metadata);

                // Update image metadata to indicate PNG format
                const metadataRef = ref(storage, `images/${snapshot.metadata.name}`);
                const currentMetadata = await getMetadata(metadataRef);
                const updatedMetadata = {
                    ...currentMetadata,
                    contentType: "image/png", // Update the content type to PNG
                };
                await updateMetadata(metadataRef, updatedMetadata);

                await addDoc(collection(db, "posts"), {
                    description: data?.description,
                    category: data?.category,
                    image: snapshot.metadata ? snapshot.metadata.name : files[0].name,
                    created: Timestamp.now(),
                }).then(() => {
                    toast.success("Your Post Is Added");
                    props.onHide(); // Close the modal after successful submission
                    setData(initialState);
                }).catch((err) => toast(err));
            });
        } catch (err) {
            console.log(err);
            alert(err);
        }
    };

    // Helper function to convert an image to PNG format
    const convertToPNG = async (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, "image/png", 1);
            };

            img.onerror = (error) => {
                reject(error);
            };
        });
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': []
        },
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)

            })));
        }
    });

    const thumbs = files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                    // Revoke data uri after image is loaded
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                />
            </div>
        </div>
    ));

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, []);


    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add Post
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <p>Add Image</p>
                    <section style={{ backgroundColor: 'aliceblue', border: '1px dashed black ' }} className="container">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p style={{ textAlign: "center" }}>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                        <aside style={thumbsContainer}>
                            {thumbs}
                        </aside>
                    </section>
                    <br />

                    <p>Add Description</p>
                    <textarea
                        className="form-control mt-1"
                        placeholder="Enter Description"
                        name='description'
                        onChange={onHandleChange}
                    />
                    <br />
                    <p>Add Category</p>
                    <Form.Select
                        aria-label="Default select example"
                        name="category"
                        onChange={onHandleChange}
                        value={data.category}
                    >
                        <option value="Adopted">Adopted</option>
                        <option value="Sell">Sell</option>
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button type='submit'>Submit</Button>
                </Modal.Footer>
            </Form>
        </Modal >
    );
}


export default Feed;