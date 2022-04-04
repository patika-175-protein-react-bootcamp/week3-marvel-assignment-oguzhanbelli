import "./App.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import Loader from "./components/Loader";
function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setcurrentPage] = useState(1);

  const [pageNumberLimit, setpageNumberLimit] = useState(5);
  const [maxPageNumberLimit, setmaxPageNumberLimit] = useState(6);
  const [minPageNumberLimit, setminPageNumberLimit] = useState(0);
  const [pageLimit, setPageLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const pages = [];
  for (let i = 1; i <= Math.ceil(data.data?.total / pageLimit); i++) {
    pages.push(i);
    if (i === maxPageNumberLimit) {
      pages.push("...");
    } else if (i === pageNumberLimit + 1) {
      pages.push("...");
    }
  }

  const getCharachter = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}?apikey=${process.env.REACT_APP_MARVEL_API}&hash=${process.env.REACT_APP_MARVEL_HASH_API}&limit=${pageLimit}&offset=${offset}`
      );
      setData(data);
      setLoading(false);
      if (!sessionStorage.getItem(`page ${currentPage}`)) {
        sessionStorage.setItem(`page ${currentPage}`, JSON.stringify(data));
      }
     
    } catch (err) {
      const message = err.response
        ? `Request failed with ${err.response.status}: ${err.response.statusText}`
        : err.message;
      alert(message);

      setLoading(false);
    }
    setLoading(false);
  };

  const scrollTo = (scrollLength) => {
    const marvellogo = document.querySelector(".marvellogo");

    window.scroll({
      top: marvellogo.offsetHeight * -2,
      behavior: "smooth",
    });
  };
 
  const handleClick = (number) => (event) => {
    if (sessionStorage.getItem(`page ${number}`)) {
      setLoading(true);
      const dataSession = JSON.parse(sessionStorage.getItem(`page ${number}`));
      setcurrentPage(Number(event.target.id));

      setData(dataSession);

      scrollTo();
      setInterval(() => {
        setLoading(false);
      }, 1000);
    } else {
       
      setcurrentPage(Number(event.target.id));
      setOffset((number - 1) * 20);
      setPageLimit(20);
      
      scrollTo();
    }
  };

  const handleNextbtn = () => {
    
    if (sessionStorage.getItem(`page ${currentPage + 1}`)) {
      const dataSession = JSON.parse(
        sessionStorage.getItem(`page ${currentPage + 1}`)
      );

      setcurrentPage(Number(currentPage + 1));
      setData(dataSession);
      scrollTo();
    } else {
      setcurrentPage(Number(currentPage + 1));
      setOffset(currentPage * 20);
    }

    if (currentPage + 1 > maxPageNumberLimit) {
      setmaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
      setminPageNumberLimit(minPageNumberLimit + pageNumberLimit);
    }
  };

  const handlePrevbtn = () => {
    if (sessionStorage.getItem(`page ${currentPage - 1}`)) {
      const dataSession = JSON.parse(
        sessionStorage.getItem(`page ${currentPage - 1}`)
      );
      setcurrentPage(Number(currentPage - 1));
      setData(dataSession);
      scrollTo();
    } else {
      setcurrentPage(Number(currentPage - 1));
      setOffset((currentPage - 2) * 20);
    }

    if ((currentPage - 1) % pageNumberLimit === 0) {
      setmaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
      setminPageNumberLimit(minPageNumberLimit - pageNumberLimit);
    }
  };

  const renderPageNumbers = pages.map((number, idx) => {
    if (number < maxPageNumberLimit + 1 && number > minPageNumberLimit) {
      return (
        <li
          key={number}
          className={currentPage === number ? "is-active" : null}
        >
          <button
            id={number}
            disabled={currentPage === currentPage[0] && loading ? true : false}
            onClick={handleClick(number)}
          >
            {number}
          </button>
        </li>
      );
    } else if (number === "...") {
      return (
        <li
          key={idx * 1000 - 2}
          className={currentPage === number ? "is-active" : null}
        >
          <button id={number}>{number}</button>
        </li>
      );
    } else {
      return null;
    }
  });
  useEffect(() => {

    getCharachter();
  }, [offset]);

  return (
    <div className="App">
      <header className="headeradc">
        <div className="marvellogo"></div>
      </header>
      <section>
        <div className="container">
          {loading ? (
            <div className="loaderContainer">
              {" "}
              <Loader />
            </div>
          ) : (
            data.data?.results.map((item, index) => (
              <div key={index} className="card">
                <div>
                  <div>
                    <img
                      src={item.thumbnail.path + "." + item.thumbnail.extension}
                      alt={item.id}
                      className="image"
                    />
                  </div>
                  <h4 className="card-text">{item.name} </h4>
                </div>
              </div>
            ))
          )}
        </div>
        {data.data?.results ? (
          <div className="paginationContainer">
            <nav className="pagination">
              <button
                onClick={handlePrevbtn}
                disabled={currentPage === pages[0] && loading ? true : false}
                className="pagination__arrow pagination__prev"
              >
                <FaAngleLeft />
              </button>
              <ul className="pagination__items">{renderPageNumbers}</ul>

              <button
                onClick={handleNextbtn}
                disabled={
                  currentPage === pages[pages.length - 1] ? true : false
                }
                className="pagination__arrow pagination__next"
              >
                <FaAngleRight />
              </button>
            </nav>
          </div>
        ) : (
          ""
        )}
      </section>
    </div>
  );
}

export default App;
