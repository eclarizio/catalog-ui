import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import asyncComponent from './Utilities/asyncComponent';
import some from 'lodash/some';

/**
 * Aysnc imports of components
 *
 * https://webpack.js.org/guides/code-splitting/
 * https://reactjs.org/docs/code-splitting.html
 *
 * pros:
 *      1) code splitting
 *      2) can be used in server-side rendering
 * cons:
 *      1) naming chunk names adds unnecessary docs to code,
 *         see the difference with DashboardMap and InventoryDeployments.
 *
 */
const ServicePortal = asyncComponent(() => import('./SmartComponents/ServicePortal/ServicePortal'));
const PlatformItems = asyncComponent(() => import('./SmartComponents/Platform/PlatformItems'));
const Portfolios = asyncComponent(() => import('./SmartComponents/Portfolio/Portfolios'));
const Portfolio = asyncComponent(() => import('./SmartComponents/Portfolio/Portfolio'));
const Orders = asyncComponent(() => import('./SmartComponents/Order/Orders'));

const paths = {
  service_portal: '/',
  platform_items: '/platform_items/:id',
  portfolios: '/portfolios',
  portfolio: '/portfolios/:id',
  orders: '/orders'
};

type Props = {
    childProps: any
};

const InsightsRoute = ({ rootClass, ...rest }) => {
  const root = document.getElementById('root');
  root.removeAttribute('class');
  root.classList.add(`page__${rootClass}`, 'pf-l-page__main');
  root.setAttribute('role', 'main');

  return (<Route { ...rest } />);
};

InsightsRoute.propTypes = {
  component: PropTypes.func,
  rootClass: PropTypes.string
};

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = (props: Props) => {
  const path = props.childProps.location.pathname;
  return (
    <Switch>
      <InsightsRoute exact path={ paths.service_portal } component={ ServicePortal } rootClass="service_portal" />
      <InsightsRoute path={ paths.platform_items } component={ PlatformItems } rootClass="platform_items" />
      <InsightsRoute exact path={ paths.portfolios } component={ Portfolios } rootClass="portfolios" />
      <InsightsRoute path={ paths.portfolio } component={ Portfolio } rootClass="portfolio" />
      <InsightsRoute exact path={ paths.orders } component={ Orders } rootClass="service_portal" />
      { /* Finally, catch all unmatched routes */ }
      <Route render={ () => (some(paths, p => p === path) ? null : <Redirect to={ paths.service_portal } />) } />
    </Switch>
  );
};

Routes.propTypes = {
  childProps: PropTypes.object
};
