import React, { Component } from "react";
import axios from "axios";
import DiscoverBlock from "./DiscoverBlock/components/DiscoverBlock";
import "../styles/_discover.scss";
import cred from "../../../config";
import qs from "querystring";

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: [],
    };

    this.refreshAccess_token = this.refreshAccess_token.bind(this);
  }

  componentDidMount() {
    //get access_token is not available

    if (localStorage.getItem("token")) {
      const auth = new URLSearchParams(window.location.search);
      if (!auth.get("code")) {
        window.location.href =
          "https://accounts.spotify.com/authorize?client_id=40e78a830b7d4035a8a840a9def4305f&response_type=code&redirect_uri=http://localhost:3000/&scope=user-read-email";
      }

      //get access token
      if (!auth.get("code")) return;

      var data = qs.stringify({
        client_id: "40e78a830b7d4035a8a840a9def4305f",
        client_secret: "17aca3b6e6b84c798b5e7652408dd1ce",
        grant_type: "authorization_code",
        code: auth.get("code"),
        redirect_uri: "http://localhost:3000/",
      });
      var config = {
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          var expireTime = new Date();
          expireTime.setMinutes(
            expireTime.getMinutes() + response.data.expires_in
          );
          localStorage.setItem(
            "token",
            JSON.stringify({ ...response.data, expireTime })
          );
        })
        .catch(function (error) {
          if (error.response) {
            // Request made and server responded
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
        });
    }

    //getData
    if (JSON.parse(localStorage.getItem("token")).expireTime < new Date())
    this.refreshAccess_token();

    axios
      .get(
        "https://api.spotify.com/v1/browse/new-releases?country=IN&limit=20&offset=5",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " +
              JSON.parse(localStorage.getItem("token")).access_token,
          },
        }
      )
      .then((resp) => {
        this.setState(() => {
          return {
            newReleases: resp.data.albums.items,
          };
        });
      })
      .catch((e) => {
        console.log(e);
      });

    axios
      .get("https://api.spotify.com/v1/browse/featured-playlists", {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("token")).access_token,
        },
      })
      .then((resp) => {
        this.setState(() => {
          return {
            playlists: resp.data.playlists.items,
          };
        });
      })
      .catch((e) => {
        console.log(e);
      });

    axios
      .get("https://api.spotify.com/v1/browse/categories", {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("token")).access_token,
        },
      })
      .then((resp) => {
        this.setState(() => {
          return {
            categories: resp.data.categories.items,
          };
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }

  refreshAccess_token = ()=> {
    var encodedData = window.btoa(cred.clientId + ":" + cred.clientSecret);
    var authorizationHeaderString = "Basic " + encodedData;

    var data = qs.stringify({
      grant_type: "refresh_token",
      refresh_token: JSON.parse(localStorage.getItem('token')).refresh_token
    });
    var config = {
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": authorizationHeaderString
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        var expireTime = new Date();
        expireTime.setMinutes(
          expireTime.getMinutes() + response.data.expires_in
        );
        localStorage.setItem(
          "token",
          JSON.stringify({ ...response.data, expireTime })
        );
      })
      .catch(function (error) {
        if (error.response) {
          // Request made and server responded
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
      });
  }

  render() {
    const { newReleases, playlists, categories } = this.state;

    return (
      <div className="discover">
        <DiscoverBlock
          text="RELEASED THIS WEEK"
          id="released"
          data={newReleases}
        />
        <DiscoverBlock
          text="FEATURED PLAYLISTS"
          id="featured"
          data={playlists}
        />
        <DiscoverBlock
          text="BROWSE"
          id="browse"
          data={categories}
          imagesKey="icons"
        />
      </div>
    );
  }
}
