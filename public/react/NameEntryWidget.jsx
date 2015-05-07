var NameEntryWidget = React.createClass({
  render: function() {
    return (
      <div class="bannerText">
        <div class="bannerLabel">GPS Chat</div>
        <img id="entryLoader" src="images/loader.gif"/>
        <input type="Text" id="txtUserName" placeholder="Enter your name.." />
        <input type="Button" id="btnSendUser" onclick={this.props.handleClick} value="Join Chat"/>
        <div id="error">User name is required.</div>
        <div id="userExistsError"></div>
      </div>
    );
  }
});