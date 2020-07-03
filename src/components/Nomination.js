import React from 'react';
import {
  Link,
  Redirect
} from "react-router-dom";

import '../App.css';
import * as waxjs from "@waxio/waxjs/dist";

const wax = new waxjs.WaxJS('https://testnet.waxsweden.org', null, null, false);

class Nomination extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
  		activeUser: [this.props.activeUser],
  		isNominated: '',
  		hasAccepted: false
  	}
  }

  async checkNominations() {
  	try {
        let resp = await wax.rpc.get_table_rows({             
            code: 'oig',
            scope: 'oig',
            table: 'nominations',
            limit: 1,
            lower_bound: this.props.accountName,
            upper_bound: this.props.accountName,
            json: true
        });
        console.log(resp.rows);
        if (resp.rows == ''){
      		console.log('No nominations!');
      	} else {
      		this.setState({
      			isNominated: true
      		});
      		if (resp.rows[resp.rows.length - resp.rows.length].accepted == 1){
      			this.setState({
      				hasAccepted: resp.rows[resp.rows.length - resp.rows.length].accepted
      			});
      		}
      		console.log(this.state);
      	}
        } catch(e) {
          console.log(e);
      }     
  }

  async nominateCandidate() {
  	try {
      const result = await wax.api.transact({
        actions: [{
          account: 'oig',
          name: 'nominate',
          authorization: [{
            actor: this.props.accountName,
            permission: 'active',
          }],
          data: {
            nominator: this.props.accountName,
            nomination: this.state.nominee,
          },
        }],
        blocksBehind: 3,
        expireSeconds: 30,
      });
    } catch(e) {
      console.log(e);
    }
  }

  async acceptNomination() {
  	try {
      const result = await wax.api.transact({
        actions: [{
          account: 'oig',
          name: 'decide',
          authorization: [{
            actor: this.props.accountName,
            permission: 'active',
          }],
          data: {
            nominee: this.props.accountName,
            decision: 1,
          },
        }]
        }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
    } catch(e) {
      console.log(e);
    }
  }

  async declineNomination() {
  	try {
      const result = await wax.api.transact({
        actions: [{
          account: 'oig',
          name: 'decide',
          authorization: [{
            actor: this.props.accountName,
            permission: 'active',
          }],
          data: {
            nominee: this.props.accountName,
            decision: 0,
          },
        }]
        }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
    } catch(e) {
      console.log(e);
    }
  }

  async updateNominee() {
  	try {
      const result = await wax.api.transact({
        actions: [{
          account: 'oig',
          name: 'update_nominee',
          authorization: [{
            actor: this.props.accountName,
            permission: 'active',
          }],
          data: {
            nominee: this.props.accountName,
          	logo_256: this.state.logo_256,
          	description: this.state.description,
          	website: this.state.website,
          	telegram: this.state.telegram,
          	twitter: this.state.twitter,
          	wechat: this.state.wechat
          },
        }],
        blocksBehind: 3,
        expireSeconds: 30,
      });
    } catch(e) {
      console.log(e);
    }
  }

  handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState(prevState => ({
            [name]: value,
            }), () => { console.log(this.state) }
        );
    }

  componentDidMount() {
  	return this.checkNominations();
  }

  isNominated() {
  	if (this.state.isNominated == true && this.state.hasAccepted == 0) {
  		return (
  			<div className="nomination-list">
      			<h3>{this.props.accountName}'s Nomination Status</h3>
      			<p>Someone has nominated you for a WAX Office of the Inspector General position!</p>
      			<button onClick={this.acceptNomination} className="btn">Accept</button>
            <button onClick={this.declineNomination} className="btn accept">Decline</button>
      		</div>
  		);
  	} else if (this.state.isNominated == true && this.state.hasAccepted == 1) {
  		return (
  			<div className="nomination-list">
      			<h3>{this.props.accountName}'s Nomination Status</h3>
      			<p>You've accepted your nomination. If you would like to change your mind, click decline below.</p>
      			<button onClick={this.declineNomination} className="btn decline">Decline</button>
      		</div>
  		);
  	} else {
  		return (
  			<div className="nomination-list">
          		<h3>{this.props.accountName}'s Nominations</h3>
          		<p>You are not currently nominated for a WAX office of the Inspector General position. You can nominate yourself or someone else below.</p>
          	</div>
  		);
  	}
      
  }

  nominationForm() {
    return (
        <div className="nomination-form">
          <div className="form-row">
            <h3>Nominate a Candidate</h3>
            <p>Enter the WAX account name of the person you would like to nominate.</p>
            <input type="text" name="nominee" className="inline-input" placeholder="Nominee's WAX account name" onChange={this.handleInputChange} />
            <button onClick={this.nominateCandidate} className="btn inline-btn">Nominate</button>
          </div>
        </div>
      );
  }

  hasAccepted() {
  	if (this.state.hasAccepted == 1){
  		return (
  			<div className="nomination-info-form">
	  			<h3>Submit or Update Candidicy Information</h3>
  				<div className="form-row">
  					<label for="logo_256">Picture</label>
  					<input type="file" name="logo_256" onChange={this.handleInputChange} />
				</div>
				<div className="form-row">
  					<label for="description">Candidicy Platform</label>
  					<textarea name="description" maxlength="2000" onChange={this.handleInputChange}></textarea>
				</div>
				<div className="form-row">
  					<label for="website">Website or Announcement</label>
  					<input type="text" name="website" maxlength="256" placeholder="http://yoururl.com" onChange={this.handleInputChange} />
				</div>
				<div className="form-row">
  					<label for="telegram">Telegram Handle</label>
  					<input type="text" name="telegram" maxlength="99" placeholder="@yourhandle" onChange={this.handleInputChange} />
				</div>
				<div className="form-row">
  					<label for="twitter">Twitter Profile</label>
  					<input type="text" name="twitter" maxlength="256" placeholder="http://twitter.com" onChange={this.handleInputChange} />
				</div>
				<div className="form-row">
  					<label for="wechat">WeChat Profile</label>
  					<input type="text" name="wechat" maxlength="256" placeholder="http://wechat.com" onChange={this.handleInputChange} />
				</div>
				<button onClick={this.updateNominee} className="btn">Submit</button>
  			</div>
		);
  	}
  }


  render() {
  	console.log(this.props.activeUser);
  	if (this.props.activeUser == null) {
        
        return (
                <>
                <Redirect to='/' />
                </>
                )
    }  		
    return (	
      <div className="nomination main-content">
        <div className="nomination-header">
          <h2>Nominate</h2>
        </div>
        <div className="nomination-left-pane">
          {this.isNominated()}
          {this.nominationForm()}
        </div>
        <div className="nomination-right-pane">
        {this.hasAccepted()}
        </div>
      </div>
    );
  }
}

export default Nomination;
