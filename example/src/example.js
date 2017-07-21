import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import BurgerMenu from 'react-burger-menu';
import classNames from 'classnames';
import { Row, Col } from 'react-simple-flex-grid';
import ReactModal from 'react-modal';

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  show() {
    this.setState({hidden : false});
  }

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className='left'>
        {this.props.children}
      </div>
    );
  }
}

class Page extends Component {
  render() {
    const page = this.props.page;
    return (
      <a href="#" onClick={() => this.props.onClick(page.name)}>
        <div className='page-browser__page-list-unit'>
          <img src={page.url} />
          <p className='header'>{page.name}</p>
          <p>{page.category}</p>
        </div>
      </a>);
  }
}

function PageList(props) {
  const pages = props.pages;
  const pageList = pages.map((page, idx) =>
    <Page page={page} key={idx} onClick={props.onClick} />
  );
  return (
    <div className="page-browser__page-list">
      {pageList}
    </div>);
}

class TextPost extends Component {
  render() {
    const post = this.props.post;
    const date = new Date(post.created);
    return (
        <div className='page-browser__post-list-unit'>
          <div className='meta-data'>
            <p className='date'>{date.toDateString()} at {date.toLocaleTimeString()}</p>
            <p className='views'>Views: {post.views}</p>
              <span className='published'>{post.hidden ? 'Unpublished' : 'Published'}</span>
              <i className={post.hidden ? "" :  "fa fa-fw fa-check"} />
            <div className='underline'></div>
          </div>
          <div className='header'>
            <p>{post.message}</p>
          </div>
        </div>);
  }
}

class PicturePost extends Component {
  render() {
    const post = this.props.post;
    const date = new Date(post.created);
    return (
        <div className='page-browser__post-list-unit'>
          <div className='meta-data'>
            <p className='date'>{date.toDateString()} at {date.toLocaleTimeString()}</p>
            <p className='views'>Views: {post.views}</p>
              <span className='published'>{post.hidden ? 'Unpublished' : 'Published'}</span>
              <i className={post.hidden ? "" :  "fa fa-fw fa-check"} />
            <div className='underline'></div>
          </div>
          <div className='header'>
            <p>{post.message}</p>
            <img className="post-picture" src={post.picture} />
          </div>
        </div>);
  }
}

function PostList(props) {
  const posts = props.posts;
  const postList = [];
  posts.forEach((post, idx) => {
    if (post.picture == undefined) {
      postList.push(<TextPost post={post} key={idx} />)
    }
    else {
      postList.push(<PicturePost post={post} key={idx} />)
    }
  });

  return (
    <div className="page-browser__post-list">
      {postList}
    </div>);
}

function PostBar(props) {
  return (
    <div className="post-bar">
      <Col span={6}>
        <div className='post-filter'>
          <span>
            <input onChange={props.onChange} checked={props.filters.showAll} type='radio' name='listType' id='showAll'/>
            <label htmlFor='list-all'>All</label>
          </span>
          <span>
            <input onChange={props.onChange} checked={props.filters.showUnpub} type='radio' name='listType' id='showUnpub'/>
            <label htmlFor='list-unpub'>Unpublished</label>
          </span>
          <span>
            <input onChange={props.onChange} checked={props.filters.showPub} type='radio' name='listType' id='showPub'/>
            <label htmlFor='list-pub'>Published</label>
          </span>
        </div>
      </Col>
      <Col span={3} offset={3}>
        <section className="styled-button">
          <button onClick={() => props.onClick()}>Create</button>
        </section>
      </Col>
    </div>);
}

class PageBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: {},
      currentPage: 0,
      showModal: false,
      isChecked: false,
      newText: '',
      searchText: '',
      showAll: true,
      showPub: false,
      showUnpub: false
    }

    this.updatePage = this.updatePage.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleModalPost = this.handleModalPost.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    var self = this;
    var page = nextProps.pages[this.state.currentPage];
    var pageStats = {
      day: page.day,
      day_date: page.day_date,
      week: page.week,
      week_date: page.week_date,
      days_28: page.days_28,
      days_28_date: page.days_28_date
    };

    if (!this.state.posts[page.id]) {
      getPosts(page.id)
        .then(response => {
          console.log('will receive');
          return getViews(response);
        })
        .then(response => {
          var newPosts = this.state.posts;
          newPosts[page.id] = response;
          self.setState({
            posts: newPosts
          });
        })
        .then(response => {
          this.props.updateStats(pageStats);
          this.props.update(page.name);
        });
    }
  }

  updatePage(pageName) {
    var self = this;
    var pageIdx = this.props.pages.findIndex((p) => {
      return p.name === pageName;
    });
    var page = this.props.pages[pageIdx];
    var pageStats = {
      day: page.day,
      day_date: page.day_date,
      week: page.week,
      week_date: page.week_date,
      days_28: page.days_28,
      days_28_date: page.days_28_date
    };

    this.setState({
      currentPage: pageIdx
    });
    if (!this.state.posts[page.id]) {
      getPosts(page.id)
        .then(response => {
          console.log('update');
          return getViews(response);
        })
        .then(response => {
          var newPosts = this.state.posts;
          newPosts[page.id] = response;
          self.setState({
            posts: newPosts
          });
        });
    }

    this.props.updateStats(pageStats);
    this.props.update(page.name);
  }

  handleRadioChange(event) {
    const target = event.target;
    var filters = {
      'showAll': false,
      'showPub': false,
      'showUnpub': false
    };
    filters[target.id] = target.checked;
    this.setState(filters);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = (target.type === 'checkbox') ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }

  handleModalPost() {
    var self = this;
    var page = this.props.pages[this.state.currentPage];
    publishPost(page.id, this.state.newText, this.state.isChecked, page.access_token)
      .then(response => {
        return getPosts(page.id)
      })
      .then(response => {
        return getViews(response);
      })
      .then(response => {
        var newPosts = this.state.posts;
        newPosts[page.id] = response;
        self.setState({
          posts: newPosts,
          isChecked: false,
          newText: ''
        });
      })
      .then(response => {
        this.handleCloseModal();
      });
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }

  filterPages() {
    let filteredPages = []
    let search = this.state.searchText.toLowerCase();
    this.props.pages.forEach(p => {
      if (p.name.toLowerCase().indexOf(search) != -1 ||
          p.category.toLowerCase().indexOf(search) != -1)
      {
        filteredPages.push(p);
      }
    })

    return filteredPages;
  }

  render() {
    var filters = {
      'showAll': this.state.showAll,
      'showPub': this.state.showPub,
      'showUnpub': this.state.showUnpub
    };
    var filteredList = [];
    var filteredPages = [];

    // Filter posts by radio button
    if (Object.keys(this.state.posts).length > 0) {
      var pages = this.state.posts[this.props.pages[this.state.currentPage].id];
      var postList = (pages) ? pages : [];
      if (this.state.showAll) {
          filteredList = postList;
      }
      else {
        var hidden = (this.state.showUnpub) ? true : false;
        postList.forEach(p => {
          if (p.hidden == hidden) {
            filteredList.push(p);
          }
        });
      }
    }

    // Filter pages by search query
    if (this.props.pages) {
      filteredPages = this.filterPages();
    }

    return (
      <div className="page-browser__main">
        {/* START Create Post Modal */}
        <ReactModal
        isOpen={this.state.showModal}
        contentLabel="Minimal Modal Example"
        style={modalStyle}>
          <div className="modal-header">
            <a key="1" href="#" onClick={this.handleCloseModal}><i className="fa fa-fw fa-times" /></a>
            <h2>Create a New Post</h2>
          </div>
          <div className="textarea">
            <textarea name="newText" onChange={this.handleInputChange} value={this.state.newText}
              placeholder="Your text..." cols="50" rows="5"></textarea>
          </div>
          <section className="modal-button button-shift">
            <span className="switch-text left"><p>Unpublished</p></span>
            <label className="switch">
              <input name="isChecked" type="checkbox" onChange={this.handleInputChange} checked={this.state.isChecked} />
              <span className="slider round"></span>
            </label>
            <span className="switch-text right"><p>Published</p></span>
            <button onClick={this.handleModalPost} >Post</button>
          </section>
        </ReactModal>
        {/* END Create Post Modal */}

        {/* START Page Browser */}
        <Row style={{height: '100%'}}>
          <div className="page-browser">
            <Col span={3} style={{height: '100%'}}>
              <div className="post-bar search-bar">
                <i className="fa fa-fw fa-search" />
                <span>
                  <input name='searchText' type='text' value={this.state.searchText} onChange={this.handleInputChange} />
                </span>
              </div>
              <PageList pages={filteredPages} onClick={this.updatePage} />
            </Col>
            <Col span={9} style={{height: '100%', overflow: 'hidden'}}>
              <Row>
                <PostBar filters={filters}   onChange={this.handleRadioChange} onClick={this.handleOpenModal} />
              </Row>
              <PostList posts={filteredList} />
            </Col>
          </div>
        </Row>
        {/* END Page Browser */}
      </div>);
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginHidden: false,
      mainHidden: true,
      pages: [],
      pageImpressions: {
        day: 0,
        day_date: "2017-07-18T07:00:00+0000",
        week: 0,
        week_date: "2017-07-18T07:00:00+0000",
        days_28: 0,
        days_28_date: "2017-07-18T07:00:00+0000"
      }
    };

    this.setMainState = this.setMainState.bind(this);
    this.updateStats = this.updateStats.bind(this);
  }

  updateStats(data) {
    this.setState({
      pageImpressions: data
    });
  }

  setMainState(data) {
    this.setState({
      loginHidden: !this.state.loginHidden,
      mainHidden: !this.state.mainHidden,
      pages: data
    });
  }

  render() {
    let loginStyle = (this.state.loginHidden) ? {display: 'none'} : null;
    let mainStyle = (this.state.mainHidden) ? {display: 'none'} : null;

    return (
      <div className="main">
        <div className="login" style={loginStyle}>
          <h2 className="description">A simple tool for viewing all your Facebook pages in one application.</h2>
          <h1>Try it out!</h1>
          <nav className="demo-buttons">
            <LoginButton onClick={() => login(this.setMainState)} />
          </nav>
        </div>
        <div style={mainStyle}>
          <Row className='page-stats'>
            <Col span={2} offset={3}>
              <h1>{this.state.pageImpressions.day}</h1>
              <h2>daily views</h2>
              <p>as of {new Date(this.state.pageImpressions.day_date).toDateString()}</p>
            </Col>
            <Col span={2}>
              <h1>{this.state.pageImpressions.week}</h1>
              <h2>weekly views</h2>
              <p>as of {new Date(this.state.pageImpressions.week_date).toDateString()}</p>
            </Col>
            <Col span={2}>
              <h1>{this.state.pageImpressions.days_28}</h1>
              <h2>monthly views</h2>
              <p>as of {new Date(this.state.pageImpressions.days_28_date).toDateString()}</p>
            </Col>
          </Row>
          <PageBrowser updateStats={this.updateStats} update={this.props.update} pages={this.state.pages} />
        </div>
      </div>
    );
  }
}

class LoginButton extends Component {
  render() {
    return (
      <a className="current-demo" onClick={() => this.props.onClick()}>
        Login
      </a>
    );
  }
}

class Demo extends Component {
  componentDidMount() {
    window.fbAsyncInit = function() {
      FB.init({
        appId            : '1747083968654170',
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.9'
      });
    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  constructor (props) {
    super(props);
    this.state = {
      currentMenu: 'stack',
      header: 'CMND'
    };
    this.updateHeader = this.updateHeader.bind(this);
  }

  changeMenu(menu) {
    this.setState({currentMenu: menu});
  }

  getItems() {
    let items;

    items = [
      <h2 key="0"><i className="fa fa-fw fa-terminal fa-2x" /><span>CMND</span></h2>,
      <a key="1" href=""><i className="fa fa-fw fa-home" /><span>Home</span></a>,
      <a key="2" href=""><i className="fa fa-fw fa-database" /><span>Analytics</span></a>,
      <a key="3" href=""><i className="fa fa-fw fa-info" /><span>About</span></a>
    ];

    return items;
  }

  getMenu() {
    const Menu = BurgerMenu[this.state.currentMenu];
    const items = this.getItems();
    let jsx;

    jsx = (
      <MenuWrap wait={20}>
        <Menu id={this.state.currentMenu} pageWrapId={'page-wrap'} outerContainerId={'outer-container'}>
          {items}
        </Menu>
      </MenuWrap>
    );

    return jsx;
  }

  updateHeader(text) {
    this.setState ({
      header: text
    });
  }

  render() {
    return (
      <div id="outer-container" style={{height: '100%'}}>
        {this.getMenu()}
        <main id="page-wrap">
          <span className='app-header'><h1>{this.state.header}</h1></span>
          <Main update={this.updateHeader} />
        </main>
      </div>
    );
  }
}

function publishPost(pageId, message, isPublished, access_token) {
  const FB = window.FB;
  return new Promise((resolve, reject) => {
    FB.api(
      pageId + '/feed',
      'POST',
      {'message': message, 'published': isPublished, 'access_token': access_token},
      function(response) {
          console.log(response);
          resolve(response);
      }
    );
  });
}

function getPosts(pageId) {
  const FB = window.FB;
  let posts = [];
  return new Promise((resolve, reject) => {
    FB.api(pageId + '/promotable_posts',
      {"fields":"created_time,id,is_hidden,message,full_picture"},
      function(response) {
        if (response && !response.error) {
          response.data.forEach(function(p) {
            let post = {};
            post['created'] = p.created_time;
            post['message'] = p.message;
            post['hidden'] = p.is_hidden;
            post['id'] = p.id;
            post['picture'] = p.full_picture;
            posts.push(post);
          });
          resolve(posts);
        }
      }
    );
  });
}

function getViews(posts) {
  const FB = window.FB;
  let batchList = [];
  posts.forEach(function(p) {
    let batchJob = {method: 'GET', relative_url: p.id + '/insights/post_impressions?fields=values'};
    batchList.push(batchJob);
  });

  return new Promise((resolve, reject) => {
    FB.api('/', 'POST', {
        batch: batchList
      },
      function (response) {
        console.log(response);
        try {
          if (response && !response.error) {
            response.forEach((r, idx) => {
              posts[idx]['views'] = JSON.parse(r.body).data[0].values[0].value;
            });
            resolve(posts);
          }
        } catch (err) {
          resolve(posts)
        }
      }
    );
  });
}

function getPageImpressions(pages) {
  const FB = window.FB;
  let batchList = [];
  pages.forEach(function(p) {
    let batchJob = {method: 'GET', relative_url: p.id + '/insights/page_impressions?fields=period,values'};
    batchList.push(batchJob);
  });

  return new Promise((resolve, reject) => {
    FB.api('/', 'POST', {
        batch: batchList
      },
      function (response) {
        try {
          if (response && !response.error) {
            response.forEach((r, idx) => {
              let body = JSON.parse(r.body);
              body.data.forEach(d => {
                pages[idx][d.period] = d.values[d.values.length - 1].value;
                pages[idx][d.period + '_date'] = d.values[d.values.length - 1].end_time;
              });
            });
            console.log(pages);
            resolve(pages);
          }
        } catch (err) {
          resolve(pages)
        }
      }
    );
  });
}

function getPages() {
  const FB = window.FB;
  return new Promise((resolve, reject) => {
    FB.api('/me/accounts', {fields: 'picture{url},category,name,id,access_token'}, function(response) {
      if (!response || response.error) {
        console.log('Error occured');
      } else {
        console.log(response);
        let pageList = [];
        response.data.map(function(d){
          let page = {url: d.picture.data.url};
          page['name'] = d.name;
          page['category'] = d.category;
          page['id'] = d.id;
          page['access_token'] = d.access_token;
          pageList.push(page);
          // console.log(getPosts(d.id));
        });
        console.log(pageList);
        resolve(pageList);
      }
    });
  });
}

function login(callback) {
  const FB = window.FB;
  FB.login(function(response) {
    // console.log(response);
    getPages()
      .then(resolve => {return getPageImpressions(resolve);})
      .then(resolve => {callback(resolve);});
  }, {scope: 'manage_pages, publish_pages, pages_show_list, read_insights, publish_actions'});
}

const menus = {
  stack: {buttonText: 'Login', items: 2}
};

ReactDOM.render(<Demo menus={menus} />, document.getElementById('app'));

const modalStyle =
{
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(255, 255, 255, 0.35)'
  },
  content : {
    position                   : 'fixed',
    top                        : 'none',
    left                       : 'none',
    right                      : '250px',
    bottom                     : '100px',
    transform                  : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'hidden',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '0'
  }
};
