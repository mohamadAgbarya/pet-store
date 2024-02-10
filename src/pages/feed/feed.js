import { getMetadata, ref, updateMetadata, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import { useDropzone } from "react-dropzone";
import "./feed.css";

import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { db, storage } from "../../firebase.config";


function Feed({ selectedCategory }) {
  const [openModal, setopenModal] = useState(false);
  const [data, setData] = useState([]);

  const [show, setShow] = useState(false);
  const [adoptedData, setAdoptedData] = useState({});

  const [sellShow, setSellShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const AdoptedModal = () => {
    return (
      <>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Contact Number</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <b>Please contant to repective person</b>
            <p>Phone Number: {adoptedData?.phoneNumber}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <a
              className="btn btn-success"
              href={`tel:${adoptedData?.phoneNumber}`}
            >
              Call
            </a>
          </Modal.Footer>
        </Modal>
      </>
    );
  };

  const SellModal = () => {
    return (
      <>
        <Modal show={sellShow} onHide={() => setSellShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Payment Method</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div class="payment-form">
              <div class="form-group">
                <label for="card-number">Card Number:</label>
                <input
                  type="text"
                  id="card-number"
                  placeholder="Enter card number"
                />
              </div>

              <div class="form-group">
                <label for="expiration-date">Expiration Date:</label>
                <input type="text" id="expiration-date" placeholder="MM/YY" />
              </div>

              <div class="form-group">
                <label for="cvc">CVC:</label>
                <input type="text" id="cvc" placeholder="Enter CVC" />
              </div>

              <button type="button" onClick={() => setSellShow(false)}>
                Submit Payment
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  };


  useEffect(() => {
    async function GetData() {
      try {
        let querySnapshot;
        if (selectedCategory) {
          // Add your delay using setTimeout
          await new Promise(resolve => setTimeout(resolve, 2000));
  
          // Fetch data with query conditions
          querySnapshot = await getDocs(
            query(
              collection(db, "posts"),
              where("category", ">=", selectedCategory),
              orderBy("category", "asc")
            )
          );
        } else {
          // Fetch all data
          querySnapshot = await getDocs(query(collection(db, "posts")));
        }
  
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    GetData();
  }, [openModal, selectedCategory]); // Ensure correct dependencies are included
  
  return (
    <>
      <Nav
        style={{

          display: "flex",
          justifyContent: "center",
          alignItems: "center", // Add this line for vertical centering
          width: "100%", // Add this line to ensure full width
          backgroundColor: "#dbe1e3", // Glass-like background color
          backdropFilter: "blur(10px)",
          top: "70px",
          color: "green",
        }}
        activeKey="/home"
        onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
      >
        <Nav.Item style={{ backgroundColor: "#6D951A" }}>
          <Nav.Link
            onClick={() => {
              setopenModal(true);
            }}
            className="text-light"
          >
            Add Advertisment
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <br />
      <Container>
        <Row>
          {data.map((item) => (
            <Col key={item.id} xs={6} md={4}>
              <Card
                style={{
                  width: "18rem",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={
                  item?.category == "adopted"
                    ? () => {
                      setShow(true);
                      setAdoptedData(item);
                    }
                    : () => {
                      setSellShow(true);
                    }
                }
              >
                <div
                  style={{
                    position: "absolute",
                    transform: "rotate(-45deg)",
                    left: "-45px",
                    top: "15px",
                    width: "150px",
                    textAlign: "center",
                  }}
                  className={`${item?.category == "adopted" ? "bg-success" : "bg-info"
                    } text-light font-weight-bold py-2`}
                >
                  {item?.category == "adopted" ? "Adopted" : "Sell"}
                </div>
                <Card.Img
                  style={{ height: "300px", objectFit: "cover" }}
                  variant="top"
                  src={`https://firebasestorage.googleapis.com/v0/b/pet-website-2f3f5.appspot.com/o/images%2F${item.image}?alt=media`}
                  alt=""
                />
                <Card.Body>
                  <Card.Text>Description: {item.description}</Card.Text>
                  {item?.price ? <Card.Text>
                    {item.price === "No Price" ? <span></span> : `Price: ${item.price}`}
                  </Card.Text> : <Card.Text>Contact: {item?.phoneNumber}</Card.Text>}
                </Card.Body>
              </Card>
              <br />
              <br />
            </Col>
          ))}
        </Row>
      </Container>
      {openModal === true ? (
        <MyVerticallyCenteredModal
          show={openModal}
          onHide={() => setopenModal(false)}
        />
      ) : (
        ""
      )}

      <AdoptedModal />
      <SellModal />
    </>
  );
}

const initialState = {
  description: "",
  category: "adopted",
};

function MyVerticallyCenteredModal(props) {
  const [data, setData] = useState(initialState);

  const [files, setFiles] = useState([]);

  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  };

  const thumb = {
    display: "inline-flex",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: "border-box",
  };

  const thumbInner = {
    display: "flex",
    minWidth: 0,
    overflow: "hidden",
  };

  const img = {
    display: "block",
    width: "auto",
    height: "100%",
  };

  const onHandleChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!files) {
      alert("Please Upload an Image to Continue");
      return false;
    }
    try {
      const storageRef = ref(
        storage,
        `images/${Math.random() * 100}${files[0].name.replace(/\s+/g, "_")}`
      );

      const convertedImageBlob = await convertToPNG(files[0]);

      uploadBytes(storageRef, convertedImageBlob).then(async (snapshot) => {
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
          phoneNumber: data?.phoneNumber || "No Phone Number",
          price: data?.price || "No Price"
        })
          .then(() => {
            toast.success("Your Post Is Added");
            props.onHide(); // Close the modal after successful submission
            setData(initialState);
          })
          .catch((err) => toast(err));
      });
    } catch (err) {
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

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          1
        );
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
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
          <Modal.Title id="contained-modal-title-vcenter">Add Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Add Image</p>
          <section
            style={{
              backgroundColor: "aliceblue",
              border: "1px dashed black ",
            }}
            className="container"
          >
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p style={{ textAlign: "center" }}>
                Drag 'n' drop some files here, or click to select files
              </p>
            </div>
            <aside style={thumbsContainer}>{thumbs}</aside>
          </section>
          <br />

          <p>Add Description</p>
          <textarea
            className="form-control mt-1"
            placeholder="Enter Description"
            name="description"
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
            <option value="adopted">Adopted</option>
            <option value="sell">Sell</option>
          </Form.Select>

          {data.category == "adopted" && (
            <>
              <p className="mt-4">Add Phone Number</p>
              <input
                className="form-control mt-1"
                placeholder="Enter Phone Number"
                name="phoneNumber"
                onChange={onHandleChange}
                required
                min={11}
                max={16}
              />
            </>
          )}
          {data.category == "sell" && (
            <>
              <p className="mt-4">Price</p>
              <input
                className="form-control mt-1"
                placeholder="Enter Price"
                name="price"
                onChange={onHandleChange}
                required
                min={11}
                max={16}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Submit</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default Feed;
