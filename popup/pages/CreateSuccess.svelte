<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';


  const handleOnStart = () => {
    push('/');
  };
</script>


<main>
  <h1>
    {$_('wallet_created.title')}
  </h1>
  <h2>
    {$_('wallet_created.subt_title')}
  </h2>
  <div class="tips">
    <h2>
      {$_('wallet_created.tips.title')}
    </h2>
    <ul>
      <li>
        {$_('wallet_created.tips.list.0')}
      </li>
      <li>
        {$_('wallet_created.tips.list.1')}
      </li>
      <li>
        {$_('wallet_created.tips.list.2')}
      </li>
      <li>
        {$_('wallet_created.tips.list.3')}
      </li>
      <li>
        {$_('wallet_created.tips.list.4')}
      </li>
    </ul>
    <h3>
      {$_('wallet_created.tips.warn')}
    </h3>
  </div>
  <button
    class="outline"
    on:mousedown={handleOnStart}
  >
    {$_('wallet_created.btn')}
  </button>
</main>


<style lang="scss">
  @import "../styles/mixins";
  h1,
  h2 {
    color: var(--text-color);
    text-align: center;
  }
  h1 {
    @include fluid-font(320px, 1024px, 22px, 55px);
  }
  h2 {
    @include fluid-font(320px, 1024px, 17px, 25px);
  }
  main {
    height: 100vh;

		@include flex-center-top-column;
  }
  ul {
    list-style: unset;
  }
  div.tips {
    padding: 30px;
    border: solid 2px var(--muted-color);
    max-width: calc(100vw - 16px);
			
    @include border-radius(16px);

    h2 {
      color: var(--primary-color);
    }
  }
  li {
    color: var(--text-color);
    font-size: 16px;
  }
  button {
    width: 290px;
    margin: 30px;
  }
</style>
