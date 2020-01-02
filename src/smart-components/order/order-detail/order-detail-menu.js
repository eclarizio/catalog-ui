import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import {
  TextContent,
  Text,
  TextVariants,
  NavList,
  Nav
} from '@patternfly/react-core';

const useNavItems = ({ state } = {}) => [
  {
    link: '',
    title: 'Order details'
  },
  {
    link: '/approval',
    title: 'Approval'
  },
  {
    link: '/provision',
    title: 'Provision',
    isDisabled: true
  },
  {
    link: '/lifecycle',
    title: 'Lifecycle',
    isDisabled: state !== 'Completed'
  }
];

const OrderDetailMenu = ({ baseUrl, isFetching }) => {
  const { search } = useLocation();
  const orderDetailData = useSelector(
    ({ orderReducer: { orderDetail } }) => orderDetail || {}
  );
  const { order } = orderDetailData;
  const navItems = useNavItems(order);
  return (
    <Nav>
      <NavList className="orders-side-nav-list">
        <li className="pf-c-nav__item orders-nav-section-group">
          <TextContent>
            <Text component={TextVariants.small}>Order steps</Text>
          </TextContent>
        </li>
        {navItems.map(({ link, title, isDisabled }) => (
          <li
            key={link || title}
            className={`pf-c-nav__item orders-side-nav-item orders-side-nav-category${
              isDisabled || isFetching ? ' disabled' : ''
            }`}
          >
            <NavLink
              exact
              to={{
                pathname: `${baseUrl}${link}`,
                search
              }}
              className="pf-c-nav__link orders-side-nav-link"
              activeClassName="pf-m-active"
            >
              {title}
            </NavLink>
          </li>
        ))}
      </NavList>
    </Nav>
  );
};

OrderDetailMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  isFetching: PropTypes.bool
};

export default OrderDetailMenu;