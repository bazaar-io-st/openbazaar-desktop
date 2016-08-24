import $ from 'jquery';
import '../../utils/velocity';
import _ from 'underscore';
// import app from '../../../app';
import { isScrolledIntoView } from '../../utils/dom';
import loadTemplate from '../../utils/loadTemplate';
// import SimpleMessage from '../SimpleMessage';
// import Dialog from '../Dialog';
// import ScrollLinks from '../ScrollLinks';
import BaseModal from './BaseModal';
// import General from './General';

export default class extends BaseModal {
  constructor(options = {}) {
    if (!options.model) {
      throw new Error('Please provide a model.');
    }

    const opts = {
      removeOnClose: true,
      modelContentClass: 'modalContent clrP border clrBr',
      // removeOnRoute: false,
      ...options,
    };

    super(opts);
    this.options = opts;
    this.mode = options.mode || 'create';

    // this.listenTo(app.router, 'will-route', () => {
    //   this.close(true);
    //   this.remove();
    // });
  }

  className() {
    return `${super.className()} editListing tabbedModal`;
  }

  events() {
    return {
      'click .js-scrollLink': 'onScrollLinkClick',
      'click .js-save': 'onSaveClick',
      ...super.events(),
    };
  }

  get mode() {
    return this._mode;
  }

  set mode(mode) {
    if (['create', 'edit'].indexOf(mode) === -1) {
      throw new Error('Please specify either a \'create\' or \'edit\' mode.');
    }
  }

  onScrollLinkClick(e) {
    this.$scrollLinks.removeClass('active');
    $(e.target).addClass('active');
    this.$scrollContainer.off('scroll', this.throttledOnScrollContainer);

    this.$scrollToSections.eq($(e.target).index())
      .velocity('scroll', {
        container: this.$scrollContainer,
        complete: () => this.$scrollContainer.on('scroll', this.throttledOnScrollContainer),
      });
  }

  onSaveClick() {
    // temporary approach
    this.model.set(this.model.toJSON(), { validate: true });
    this.render();
  }

  // get $saveStatus() {
  //   return this._$saveStatus || this.$('.saveStatus');
  // }

  get $scrollToSections() {
    return this._$scrollToSections || this.$('.js-scrollToSection');
  }

  get $scrollLinks() {
    return this._$scrollLinks || this.$('.js-scrollLink');
  }

  // get $scrollContainer() {
  //   return this._$scrollContainer || this.$('.js-scrollContainer');
  // }

  onScrollContainer() {
    let index = 0;
    let keepLooping = true;

    while (keepLooping) {
      if (isScrolledIntoView(this.$scrollToSections[index])) {
        this.$scrollLinks.removeClass('active');
        this.$scrollLinks.eq(index).addClass('active');
        keepLooping = false;
      } else {
        index += 1;
      }
    }
  }

  render() {
    loadTemplate('modals/editListing.html', (t) => {
      this.$el.html(t({
        mode: this.mode,
        errors: this.model.validationError || {},
        ...this.model.toJSON(),
      }));
      super.render();

      this._$scrollLinks = null;
      this._$scrollToSections = null;

      this.$scrollContainer = this.$('.js-scrollContainer');
      this.throttledOnScrollContainer = _.bind(_.throttle(this.onScrollContainer, 100), this);
      this.$scrollContainer.on('scroll', this.throttledOnScrollContainer);
    });

    return this;
  }
}

