import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core/dist/js/components/Spinner/Spinner';
import FormRenderer from '../common/form-renderer';
import { createPortfolioSchema } from '../../forms/portfolio-form.schema';
import {
  addPortfolio,
  updatePortfolio
} from '../../redux/actions/portfolio-actions';
import useQuery from '../../utilities/use-query';
import { getPortfolioFromState } from '../../helpers/portfolio/portfolio-helper';
import useEnhancedHistory from '../../utilities/use-enhanced-history';
import SpinnerWrapper from '../../presentational-components/styled-components/spinner-wrapper';
import { UnauthorizedRedirect } from '../error-pages/error-redirects';
import { PORTFOLIO_ROUTE } from '../../constants/routes';
import UserContext from '../../user-context';
import actionMessages from '../../messages/actions.messages';
import portfolioMessages from '../../messages/portfolio.messages';
import labelMessages from '../../messages/labels.messages';
import useFormatMessage from '../../utilities/use-format-message';

const AddPortfolioModal = ({ removeQuery, closeTarget, viewState }) => {
  const formatMessage = useFormatMessage();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);
  const { openApiSchema: openApiSchema } = useContext(UserContext);
  const [{ portfolio: portfolioId }] = useQuery(['portfolio']);
  const { push } = useEnhancedHistory({ removeQuery, keepHash: true });
  const initialValues = useSelector(({ portfolioReducer }) =>
    getPortfolioFromState(portfolioReducer, portfolioId)
  );

  const onAddPortfolio = async (data) => {
    const notification = {
      variant: 'success',
      title: formatMessage(portfolioMessages.addSuccessTitle),
      description: formatMessage(portfolioMessages.addSuccessDescription, {
        name: data.name,
        // eslint-disable-next-line react/display-name
        b: (chunks) => <b key="strong">{chunks}</b>
      })
    };
    const newPortfolio = await dispatch(addPortfolio(data, notification));
    return newPortfolio && newPortfolio.value && newPortfolio.value.id
      ? push({
          pathname: PORTFOLIO_ROUTE,
          search: `?portfolio=${newPortfolio.value.id}`
        })
      : push(closeTarget);
  };

  const onSubmit = (data) => {
    if (initialValues) {
      /**
       * Fake the redirect by closing the modal
       */
      setIsOpen(false);
      return dispatch(updatePortfolio(data, viewState)).then(() =>
        /**
         * Redirect only after the update was finished.
         * This will ensure that API requests are triggered in correct order when chaning the router pathname
         * */
        push(closeTarget)
      );
    } else {
      return onAddPortfolio(data, viewState);
    }
  };

  const editVariant =
    portfolioId && initialValues && Object.keys(initialValues).length > 0;

  if (initialValues?.metadata?.user_capabilities?.update === false) {
    return <UnauthorizedRedirect />;
  }

  return (
    <Modal
      title={
        portfolioId
          ? formatMessage(portfolioMessages.modalEditTitle)
          : formatMessage(portfolioMessages.modalCreateTitle)
      }
      isOpen={isOpen}
      onClose={() => push(closeTarget)}
      variant="small"
    >
      {!portfolioId || editVariant ? (
        <FormRenderer
          schema={createPortfolioSchema(
            !initialValues,
            openApiSchema,
            portfolioId
          )}
          schemaType="default"
          onSubmit={onSubmit}
          onCancel={() => push(closeTarget)}
          initialValues={{ ...initialValues }}
          formContainer="modal"
          templateProps={{
            submitLabel: portfolioId
              ? formatMessage(actionMessages.save)
              : formatMessage(labelMessages.create),
            disableSubmit: ['pristine', 'submitting']
          }}
        />
      ) : (
        <SpinnerWrapper className="pf-u-m-md">
          <Spinner />
        </SpinnerWrapper>
      )}
    </Modal>
  );
};

AddPortfolioModal.propTypes = {
  removeQuery: PropTypes.bool,
  closeTarget: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string
    })
  ]).isRequired,
  viewState: PropTypes.shape({
    count: PropTypes.number,
    limit: PropTypes.number,
    offset: PropTypes.number,
    filter: PropTypes.string
  })
};

export default AddPortfolioModal;
